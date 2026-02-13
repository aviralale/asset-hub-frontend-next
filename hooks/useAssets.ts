import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Asset, AssetFilters, PaginatedResponse } from "@/lib/types";

const ASSETS_QUERY_KEY = ["assets"];

export function useAssets(filters: AssetFilters = {}) {
  return useQuery({
    queryKey: [...ASSETS_QUERY_KEY, filters],
    queryFn: () => apiClient.getAssets(filters),
    retry: 1,
  });
}

export function useAsset(id: string | null) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => (id ? apiClient.getAsset(id) : null),
    enabled: !!id,
    retry: 1,
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      apiClient.updateAsset(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["asset", data.id], data);
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
  });
}

export function useRestoreAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.restoreAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
  });
}
