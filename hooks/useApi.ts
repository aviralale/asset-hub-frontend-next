/**
 * Custom React Hooks for API interactions
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  User,
  Asset,
  AssetListItem,
  AssetUpdateData,
  AssetFilters,
  Folder,
  Tag,
  AuditLog,
  PresignRequest,
  PresignResponse,
  CompleteUploadRequest,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  TokenResponse,
} from "@/lib/types";

// ==================== Auth Hooks ====================

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => apiClient.login(credentials),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterData) => apiClient.register(userData),
  });
}

export function useCurrentUser(): UseQueryResult<User> {
  // Only try to fetch user if there's a token
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("access_token");

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false, // Don't retry failed auth
    enabled: hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==================== Asset Hooks ====================

export function useAssets(
  filters?: AssetFilters,
): UseQueryResult<PaginatedResponse<AssetListItem>> {
  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => apiClient.getAssets(filters),
  });
}

export function useAsset(id: string): UseQueryResult<Asset> {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => apiClient.getAsset(id),
    enabled: !!id,
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AssetUpdateData }) =>
      apiClient.updateAsset(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.setQueryData(["asset", data.id], data);
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useRestoreAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.restoreAsset(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.setQueryData(["asset", data.id], data);
    },
  });
}

// ==================== Upload Hooks ====================

export function usePresignUpload() {
  return useMutation({
    mutationFn: (request: PresignRequest) => apiClient.presignUpload(request),
  });
}

export function useCompleteUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CompleteUploadRequest) =>
      apiClient.completeUpload(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

// ==================== Folder Hooks ====================

export function useFolders(): UseQueryResult<Folder[]> {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const data = await apiClient.getFolders();
      // Handle both paginated response and direct array
      return Array.isArray(data) ? data : (data as any).results || [];
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, parent }: { name: string; parent?: string }) =>
      apiClient.createFolder(name, parent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.updateFolder(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

// ==================== Tag Hooks ====================

export function useTags(): UseQueryResult<Tag[]> {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const data = await apiClient.getTags();
      // Handle both paginated response and direct array
      return Array.isArray(data) ? data : (data as any).results || [];
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.updateTag(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

// ==================== Audit Hooks ====================

export function useAuditLogs(filters?: {
  action?: string;
  target_type?: string;
  page?: number;
}): UseQueryResult<PaginatedResponse<AuditLog>> {
  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: () => apiClient.getAuditLogs(filters),
  });
}
