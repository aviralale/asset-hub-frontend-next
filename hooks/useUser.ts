import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { User } from "@/lib/types";
import { useCallback } from "react";

export function useUser() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => apiClient.getCurrentUser(),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const canUpload = useCallback((user: User | undefined) => {
    if (!user) return false;
    return ["UPLOADER", "EDITOR", "ADMIN", "OWNER"].includes(user.role);
  }, []);

  const canEdit = useCallback((user: User | undefined) => {
    if (!user) return false;
    return ["EDITOR", "ADMIN", "OWNER"].includes(user.role);
  }, []);

  const canDelete = useCallback((user: User | undefined) => {
    if (!user) return false;
    return ["ADMIN", "OWNER"].includes(user.role);
  }, []);

  const canViewAudit = useCallback((user: User | undefined) => {
    if (!user) return false;
    return ["ADMIN", "OWNER"].includes(user.role);
  }, []);

  return {
    ...query,
    canUpload: canUpload(query.data),
    canEdit: canEdit(query.data),
    canDelete: canDelete(query.data),
    canViewAudit: canViewAudit(query.data),
  };
}
