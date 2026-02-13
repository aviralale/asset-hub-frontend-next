import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { AuditLog } from "@/lib/types";

export function useAuditLogs(page = 1, action?: string) {
  return useQuery({
    queryKey: ["audit", page, action],
    queryFn: () =>
      apiClient.getAuditLogs({
        page,
        page_size: 20,
        action: action || undefined,
      }),
  });
}
