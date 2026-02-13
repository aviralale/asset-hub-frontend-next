import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Folder } from "@/lib/types";

const FOLDERS_QUERY_KEY = ["folders"];

export function useFolders() {
  return useQuery({
    queryKey: FOLDERS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.getFolders();
      return response.results;
    },
    retry: 1,
  });
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: [...FOLDERS_QUERY_KEY, id],
    queryFn: () => apiClient.getFolder(id),
    retry: 1,
    enabled: !!id,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Folder>) => apiClient.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Folder> }) =>
      apiClient.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
    },
  });
}
