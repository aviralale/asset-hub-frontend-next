import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Asset, PresignResponse } from "@/lib/types";
import { useState, useCallback } from "react";

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completing" | "done" | "error";
  error?: string;
}

export function useUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const updateProgress = useCallback(
    (fileId: string, progress: Partial<UploadProgress>) => {
      setUploadProgress((prev) => {
        const index = prev.findIndex((p) => p.fileId === fileId);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = { ...updated[index], ...progress };
        return updated;
      });
    },
    [],
  );

  const uploadFile = useCallback(
    async (
      file: File,
      metadata?: {
        folder?: string;
        tag_ids?: string[];
        status?: "pending" | "approved";
        alt_text?: string;
        caption?: string;
      },
    ): Promise<Asset> => {
      const fileId = `${Date.now()}-${Math.random()}`;

      setUploadProgress((prev) => [
        ...prev,
        {
          fileId,
          fileName: file.name,
          progress: 0,
          status: "pending",
        },
      ]);

      try {
        // Step 1: Get presigned URL
        updateProgress(fileId, { status: "uploading", progress: 10 });
        const presign: PresignResponse = await apiClient.getPresignedUrl(
          file.name,
          file.type || "application/octet-stream",
        );

        // Step 2: Upload file
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 80 + 10;
              updateProgress(fileId, {
                progress: Math.min(percentComplete, 90),
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.onabort = () => reject(new Error("Upload cancelled"));

          xhr.open("PUT", presign.upload_url);

          Object.entries(presign.required_headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });

          xhr.send(file);
        });

        // Step 3: Complete upload
        updateProgress(fileId, { status: "completing", progress: 95 });
        const asset = await apiClient.completeUpload(
          presign.storage_key,
          file.name,
          file.type,
          file.size,
          metadata,
        );

        updateProgress(fileId, { status: "done", progress: 100 });
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        return asset;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        updateProgress(fileId, {
          status: "error",
          error: errorMessage,
        });
        throw error;
      }
    },
    [updateProgress, queryClient],
  );

  const clearProgress = useCallback((fileId?: string) => {
    if (fileId) {
      setUploadProgress((prev) => prev.filter((p) => p.fileId !== fileId));
    } else {
      setUploadProgress([]);
    }
  }, []);

  return {
    uploadFile,
    uploadProgress,
    updateProgress,
    clearProgress,
  };
}
