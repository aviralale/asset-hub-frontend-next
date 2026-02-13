import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Tag } from "@/lib/types";

const TAGS_QUERY_KEY = ["tags"];

export function useTags() {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.getTags();
      return response.results;
    },
    retry: 1,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Tag>) => apiClient.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tag> }) =>
      apiClient.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}
