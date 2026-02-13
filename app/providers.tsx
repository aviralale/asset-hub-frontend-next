"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { UploadProvider } from "@/contexts/UploadContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <UploadProvider>{children}</UploadProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
