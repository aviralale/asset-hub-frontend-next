"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useUpload } from "@/hooks/useUpload";
import { useFolders, useTags } from "@/hooks/useApi";
import { toast } from "sonner";
import { CloudUploadIcon } from "./Icons";
import { X, Image as ImageIcon, File as FileIcon } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: number]: string }>({});
  const [folder, setFolder] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"pending" | "approved">("pending");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  const { uploadFile, uploadProgress, clearProgress } = useUpload();
  const { data: folders = [], isLoading: loadingFolders } = useFolders();
  const { data: tags = [], isLoading: loadingTags } = useTags();

  // Debug logging
  React.useEffect(() => {
    console.log(
      "UploadModal - Folders:",
      folders,
      "Tags:",
      tags,
      "LoadingTags:",
      loadingTags,
    );
  }, [folders, tags, loadingTags]);

  // Ensure arrays are properly initialized
  const folderList = Array.isArray(folders) ? folders : [];
  const tagList = Array.isArray(tags) ? tags : [];

  // Generate previews for files
  const generatePreview = useCallback((file: File, index: number) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => ({
          ...prev,
          [index]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const newFiles = Array.from(e.dataTransfer.files);
      const startIndex = files.length;
      newFiles.forEach((file, idx) => {
        generatePreview(file, startIndex + idx);
      });
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, generatePreview],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        const startIndex = files.length;
        newFiles.forEach((file, idx) => {
          generatePreview(file, startIndex + idx);
        });
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [files.length, generatePreview],
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    try {
      const tagIds = Array.from(selectedTags);
      for (const file of files) {
        await uploadFile(file, {
          folder: folder || undefined,
          tag_ids: tagIds,
          status,
          alt_text: altText || undefined,
          caption: caption || undefined,
        });
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
      setFiles([]);
      setFolder("");
      setSelectedTags(new Set());
      setAltText("");
      setCaption("");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Upload failed");
    }
  }, [
    files,
    selectedTags,
    folder,
    status,
    altText,
    caption,
    uploadFile,
    onClose,
    onSuccess,
  ]);

  const isUploading = uploadProgress.some(
    (p) => p.status === "uploading" || p.status === "completing",
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Assets</DialogTitle>
        </DialogHeader>
        <div className="gap-4 flex flex-col">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <CloudUploadIcon className="mx-auto mb-2 h-8 w-8 text-gray-500" />
            <p className="text-sm font-medium">Drag and drop files here</p>
            <p className="text-xs text-gray-500">or</p>
            <label className="mt-2 inline-block">
              <span className="cursor-pointer text-blue-600 hover:underline text-sm font-medium">
                click to select
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          {/* Files List with Previews */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Files ({files.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pb-2">
                {files.map((file, idx) => {
                  const isImage = file.type.startsWith("image/");
                  const hasPreview = previews[idx];

                  return (
                    <div
                      key={idx}
                      className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group"
                    >
                      {/* Preview or Icon */}
                      {isImage && hasPreview ? (
                        <img
                          src={hasPreview}
                          alt={file.name}
                          className="w-full h-24 object-cover"
                        />
                      ) : isImage ? (
                        <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      {/* File info overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex flex-col justify-end p-2">
                        <p className="text-xs text-white font-medium truncate backdrop-blur-sm bg-black bg-opacity-30 px-1 py-0.5 rounded hidden group-hover:block">
                          {file.name}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="space-y-2">
              {uploadProgress.map((item) => (
                <div key={item.fileId}>
                  <p className="text-xs font-medium mb-1">{item.fileName}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {item.status === "done" && "✓ Complete"}
                    {item.status === "uploading" && "Uploading..."}
                    {item.status === "completing" && "Completing..."}
                    {item.status === "error" && `Error: ${item.error}`}
                    {item.status === "pending" && "Pending..."}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Form */}
          {!isUploading && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Folder (optional)
                </label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger className={loadingFolders ? "opacity-50" : ""}>
                    <SelectValue
                      placeholder={
                        loadingFolders
                          ? "Loading folders..."
                          : "Select a folder"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingFolders ? (
                      <div className="px-2 py-2 text-xs text-gray-500">
                        Loading...
                      </div>
                    ) : folderList.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-gray-500">
                        No folders available
                      </div>
                    ) : (
                      folderList.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.full_path}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) =>
                    setStatus(val as "pending" | "approved")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Auto-Approve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Tags (optional)
                </label>
                <div className="flex flex-wrap gap-3">
                  {loadingTags ? (
                    <p className="text-xs text-gray-500">Loading tags...</p>
                  ) : tagList.length === 0 ? (
                    <p className="text-xs text-gray-500">No tags available</p>
                  ) : (
                    tagList.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag.id}
                          checked={selectedTags.has(tag.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTags(
                                (prev) => new Set([...prev, tag.id]),
                              );
                            } else {
                              setSelectedTags((prev) => {
                                const next = new Set(prev);
                                next.delete(tag.id);
                                return next;
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={tag.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Alt Text (optional)
                </label>
                <Input
                  placeholder="Describe the image for accessibility..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Caption (optional)
                </label>
                <Input
                  placeholder="Add a caption for this asset..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
