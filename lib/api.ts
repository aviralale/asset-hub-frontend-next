import {
  User,
  TokenResponse,
  Asset,
  PaginatedResponse,
  AssetFilters,
  Folder,
  Tag,
  PresignResponse,
  CompleteUploadRequest,
  AuditLog,
} from "./types";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://assets-api.ctrlbits.com";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseUrl}/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw new Error("Failed to refresh token");
    }

    const data: TokenResponse = await response.json();
    setTokens(data);
    return data.access;
  }

  private async handleResponse(response: Response): Promise<any> {
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data.detail || data.message || "API request failed",
      );
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(true);

    let response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    // Handle 401 with automatic refresh
    if (response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          const retryHeaders = this.getHeaders(true);
          return fetch(url, {
            ...options,
            headers: { ...retryHeaders, ...(options.headers || {}) },
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await this.refreshAccessToken();
        processQueue(null, newToken);
        isRefreshing = false;

        const retryHeaders = this.getHeaders(true);
        response = await fetch(url, {
          ...options,
          headers: { ...retryHeaders, ...(options.headers || {}) },
        });
      } catch (error) {
        processQueue(error as Error, null);
        isRefreshing = false;
        clearTokens();
        window.location.href = "/login";
        throw error;
      }
    }

    return this.handleResponse(response);
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<TokenResponse> {
    return this.makeRequest("/auth/jwt/create/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest("/auth/users/me/");
  }

  async verifyToken(token: string): Promise<{ token: string }> {
    return this.makeRequest("/auth/jwt/verify/", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // Asset endpoints
  async getAssets(
    filters: AssetFilters = {},
  ): Promise<PaginatedResponse<Asset>> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size)
      params.append("page_size", filters.page_size.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.tag) params.append("tag", filters.tag);
    if (filters.folder) params.append("folder", filters.folder);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.deleted !== undefined)
      params.append("deleted", filters.deleted.toString());

    const queryString = params.toString();
    return this.makeRequest(`/api/assets/?${queryString}`);
  }

  async getAsset(id: string): Promise<Asset> {
    return this.makeRequest(`/api/assets/${id}/`);
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    return this.makeRequest(`/api/assets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string): Promise<null> {
    return this.makeRequest(`/api/assets/${id}/`, {
      method: "DELETE",
    });
  }

  async restoreAsset(id: string): Promise<Asset> {
    return this.makeRequest(`/api/assets/${id}/restore/`, {
      method: "POST",
    });
  }

  // Upload endpoints
  async getPresignedUrl(
    filename: string,
    contentType: string,
  ): Promise<PresignResponse> {
    return this.makeRequest("/api/uploads/presign/", {
      method: "POST",
      body: JSON.stringify({
        filename,
        content_type: contentType,
      }),
    });
  }

  async completeUpload(
    storageKey: string,
    filename: string,
    mimeType: string,
    fileSize: number,
    metadata?: Partial<CompleteUploadRequest>,
  ): Promise<Asset> {
    const body = {
      storage_key: storageKey,
      filename,
      content_type: mimeType,
      size_bytes: fileSize,
      ...metadata,
    };

    return this.makeRequest("/api/uploads/complete/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Folder endpoints
  async getFolders(): Promise<PaginatedResponse<Folder>> {
    return this.makeRequest("/api/folders/");
  }

  async getFolder(id: string): Promise<Folder> {
    return this.makeRequest(`/api/folders/${id}/`);
  }

  async createFolder(data: Partial<Folder>): Promise<Folder> {
    return this.makeRequest("/api/folders/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFolder(id: string, data: Partial<Folder>): Promise<Folder> {
    return this.makeRequest(`/api/folders/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(id: string): Promise<null> {
    return this.makeRequest(`/api/folders/${id}/`, {
      method: "DELETE",
    });
  }

  // Tag endpoints
  async getTags(): Promise<PaginatedResponse<Tag>> {
    return this.makeRequest("/api/tags/");
  }

  async createTag(data: Partial<Tag>): Promise<Tag> {
    return this.makeRequest("/api/tags/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
    return this.makeRequest(`/api/tags/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string): Promise<null> {
    return this.makeRequest(`/api/tags/${id}/`, {
      method: "DELETE",
    });
  }

  // Audit endpoints
  async getAuditLogs(
    filters?: Record<string, any>,
  ): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    return this.makeRequest(`/api/audit/?${queryString}`);
  }
}

export const apiClient = new APIClient(API_BASE_URL);
