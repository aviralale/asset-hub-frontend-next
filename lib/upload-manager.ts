import { apiClient } from "./api-client";
import { generateId } from "./utils";
import type { UploadProgress, Asset } from "@/types";

export class UploadManager {
  private onProgress?: (upload: UploadProgress) => void;
  private onComplete?: (upload: UploadProgress) => void;
  private onError?: (upload: UploadProgress) => void;

  constructor(callbacks?: {
    onProgress?: (upload: UploadProgress) => void;
    onComplete?: (upload: UploadProgress) => void;
    onError?: (upload: UploadProgress) => void;
  }) {
    this.onProgress = callbacks?.onProgress;
    this.onComplete = callbacks?.onComplete;
    this.onError = callbacks?.onError;
  }

  async uploadFile(file: File, folder?: string): Promise<Asset> {
    const uploadId = generateId();
    const uploadProgress: UploadProgress = {
      id: uploadId,
      file,
      progress: 0,
      status: "pending",
    };

    try {
      // Update status to uploading
      uploadProgress.status = "uploading";
      this.onProgress?.(uploadProgress);

      // Step 1: Get presigned URL
      const presignData = await apiClient.presignUpload({
        filename: file.name,
        content_type: file.type,
        folder,
        size_bytes: file.size,
      });

      // Step 2: Upload to R2 with progress tracking
      await this.uploadToR2(
        file,
        presignData.upload_url,
        presignData.required_headers,
        (progress) => {
          uploadProgress.progress = progress;
          this.onProgress?.(uploadProgress);
        },
      );

      // Step 3: Complete upload and create asset record
      uploadProgress.status = "processing";
      uploadProgress.progress = 95;
      this.onProgress?.(uploadProgress);

      const asset = await apiClient.completeUpload({
        storage_key: presignData.storage_key,
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
        folder,
      });

      // Upload complete
      uploadProgress.status = "complete";
      uploadProgress.progress = 100;
      uploadProgress.asset = asset;
      this.onProgress?.(uploadProgress);
      this.onComplete?.(uploadProgress);

      return asset;
    } catch (error: any) {
      uploadProgress.status = "error";
      uploadProgress.error =
        error.response?.data?.detail || error.message || "Upload failed";
      this.onError?.(uploadProgress);
      throw error;
    }
  }

  async uploadMultiple(files: File[], folder?: string): Promise<Asset[]> {
    const uploads = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploads);
  }

  private uploadToR2(
    file: File,
    url: string,
    headers: Record<string, string>,
    onProgress: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 90); // 0-90% for upload
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(90);
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("PUT", url);

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(file);
    });
  }
}
