import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  User,
  TokenResponse,
  LoginCredentials,
  RegisterData,
  Asset,
  AssetListItem,
  AssetUpdateData,
  AssetFilters,
  PaginatedResponse,
  Folder,
  Tag,
  AuditLog,
  PresignRequest,
  PresignResponse,
  CompleteUploadRequest,
  ApiError,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest.headers["X-Retry"]
        ) {
          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const { data } = await axios.post(
                `${API_URL}/auth/jwt/refresh/`,
                {
                  refresh: refreshToken,
                },
              );
              this.setAccessToken(data.access);
              originalRequest.headers["X-Retry"] = "true";
              originalRequest.headers.Authorization = `Bearer ${data.access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }

        return Promise.reject(error);
      },
    );

    // Initialize tokens from localStorage
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  setRefreshToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refresh_token");
    }
    return null;
  }

  clearTokens() {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }

  // Auth endpoints
  async login(
    credentials: LoginCredentials,
  ): Promise<{ tokens: TokenResponse; user: User }> {
    const { data } = await this.client.post<TokenResponse>(
      "/auth/jwt/create/",
      credentials,
    );
    this.setAccessToken(data.access);
    this.setRefreshToken(data.refresh);

    const user = await this.getCurrentUser();
    return { tokens: data, user };
  }

  async register(userData: RegisterData): Promise<User> {
    const { data } = await this.client.post<User>("/auth/users/", userData);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get<User>("/auth/users/me/");
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  }

  logout() {
    this.clearTokens();
  }

  // Assets endpoints
  async getAssets(
    filters?: AssetFilters,
  ): Promise<PaginatedResponse<AssetListItem>> {
    const { data } = await this.client.get<PaginatedResponse<AssetListItem>>(
      "/api/assets/",
      {
        params: filters,
      },
    );
    return data;
  }

  async getAsset(id: string): Promise<Asset> {
    const { data } = await this.client.get<Asset>(`/api/assets/${id}/`);
    return data;
  }

  async updateAsset(id: string, updates: AssetUpdateData): Promise<Asset> {
    const { data } = await this.client.patch<Asset>(
      `/api/assets/${id}/`,
      updates,
    );
    return data;
  }

  async deleteAsset(id: string): Promise<void> {
    await this.client.delete(`/api/assets/${id}/`);
  }

  async restoreAsset(id: string): Promise<Asset> {
    const { data } = await this.client.post<Asset>(
      `/api/assets/${id}/restore/`,
    );
    return data;
  }

  // Upload workflow
  async presignUpload(request: PresignRequest): Promise<PresignResponse> {
    const { data } = await this.client.post<PresignResponse>(
      "/api/uploads/presign",
      request,
    );
    return data;
  }

  async uploadToR2(
    url: string,
    file: File,
    headers: Record<string, string>,
  ): Promise<void> {
    await axios.put(url, file, {
      headers,
      onUploadProgress: (progressEvent) => {
        // This will be handled by the upload manager
      },
    });
  }

  async completeUpload(request: CompleteUploadRequest): Promise<Asset> {
    const { data } = await this.client.post<Asset>(
      "/api/uploads/complete",
      request,
    );
    return data;
  }

  // Folders endpoints
  async getFolders(): Promise<Folder[]> {
    const { data } = await this.client.get<Folder[]>("/api/folders/");
    return data;
  }

  async createFolder(name: string, parent?: string): Promise<Folder> {
    const { data } = await this.client.post<Folder>("/api/folders/", {
      name,
      parent,
    });
    return data;
  }

  async updateFolder(id: string, name: string): Promise<Folder> {
    const { data } = await this.client.patch<Folder>(`/api/folders/${id}/`, {
      name,
    });
    return data;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.client.delete(`/api/folders/${id}/`);
  }

  // Tags endpoints
  async getTags(): Promise<Tag[]> {
    const { data } = await this.client.get<Tag[]>("/api/tags/");
    return data;
  }

  async createTag(name: string): Promise<Tag> {
    const { data } = await this.client.post<Tag>("/api/tags/", { name });
    return data;
  }

  async updateTag(id: string, name: string): Promise<Tag> {
    const { data } = await this.client.patch<Tag>(`/api/tags/${id}/`, { name });
    return data;
  }

  async deleteTag(id: string): Promise<void> {
    await this.client.delete(`/api/tags/${id}/`);
  }

  // Audit endpoints
  async getAuditLogs(filters?: {
    action?: string;
    target_type?: string;
    page?: number;
  }): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await this.client.get<PaginatedResponse<AuditLog>>(
      "/api/audit/",
      {
        params: filters,
      },
    );
    return data;
  }
}

export const apiClient = new ApiClient();
