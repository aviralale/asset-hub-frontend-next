"use client";

/**
 * Asset Drawer - Nothing Phone Design
 * Displays full asset details with editing capabilities
 */

import { useState, useEffect } from "react";
import {
  useAsset,
  useUpdateAsset,
  useDeleteAsset,
  useRestoreAsset,
  useFolders,
  useTags,
} from "@/hooks/useApi";
import { useUser } from "@/contexts/UserContext";
import { canUpdateAsset } from "@/lib/permissions";
import { formatFileSize, formatDate, copyToClipboard } from "@/lib/utils";
import {
  XIcon,
  Edit2Icon,
  Trash2Icon,
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
} from "lucide-react";
import type { Asset, AssetUpdateData } from "@/lib/types";

interface AssetDrawerProps {
  assetId: string | null;
  onClose: () => void;
}

export function AssetDrawer({ assetId, onClose }: AssetDrawerProps) {
  const { user, permissions } = useUser();
  const { data: asset, isLoading } = useAsset(assetId || "");
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();
  const restoreMutation = useRestoreAsset();
  const { data: folders = [] } = useFolders();
  const { data: tags = [] } = useTags();
  // Ensure arrays are properly initialized
  const folderList = Array.isArray(folders) ? folders : [];
  const tagList = Array.isArray(tags) ? tags : [];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AssetUpdateData>({});
  const [activeTab, setActiveTab] = useState<"details" | "snippets">("details");
  const [showSuccess, setShowSuccess] = useState(false);

  // Permissions
  const canEdit = user && asset && canUpdateAsset(user, asset.created_by);
  const canDelete = permissions.canDelete;

  useEffect(() => {
    if (asset) {
      setFormData({
        alt_text: asset.alt_text,
        caption: asset.caption,
        status: asset.status,
        folder: asset.folder,
        tag_ids: asset.tags.map((t) => t.id),
      });
    }
  }, [asset]);

  const handleSave = async () => {
    if (!asset) return;
    try {
      await updateMutation.mutateAsync({ id: asset.id, updates: formData });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert("Failed to update asset");
    }
  };

  const handleDelete = async () => {
    if (!asset || !confirm("Delete this asset?")) return;
    try {
      await deleteMutation.mutateAsync(asset.id);
      onClose();
    } catch (error) {
      alert("Failed to delete asset");
    }
  };

  const handleRestore = async () => {
    if (!asset) return;
    try {
      await restoreMutation.mutateAsync(asset.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert("Failed to restore asset");
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }
  };

  if (!assetId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-background h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Asset Details</h2>
          <button onClick={onClose} className="icon-btn">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {asset && (
          <div className="p-6 space-y-6">
            {/* Preview */}
            <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
              {asset.is_image ? (
                <img
                  src={asset.cdn_url}
                  alt={asset.alt_text || asset.filename_original}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Preview not available
                  </p>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                {asset.status === "APPROVED" ? (
                  <div className="badge badge-approved backdrop-blur-sm">
                    <CheckCircle2Icon className="w-3 h-3" />
                    Approved
                  </div>
                ) : (
                  <div className="badge badge-pending backdrop-blur-sm">
                    <div className="dot dot-gray" />
                    Pending
                  </div>
                )}
              </div>

              {asset.is_deleted && (
                <div className="absolute top-3 right-3">
                  <div className="badge bg-destructive/10 text-destructive backdrop-blur-sm">
                    Deleted
                  </div>
                </div>
              )}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm">Success!</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("snippets")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "snippets"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Code Snippets
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Filename
                    </p>
                    <p className="text-sm font-medium">
                      {asset.filename_original}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Size</p>
                      <p className="text-sm">
                        {formatFileSize(asset.size_bytes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <p className="text-sm">{asset.mime_type}</p>
                    </div>
                  </div>

                  {asset.width && asset.height && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Width
                        </p>
                        <p className="text-sm">{asset.width}px</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Height
                        </p>
                        <p className="text-sm">{asset.height}px</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Uploaded by
                    </p>
                    <p className="text-sm">{asset.created_by_username}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Created
                    </p>
                    <p className="text-sm">{formatDate(asset.created_at)}</p>
                  </div>
                </div>

                {/* Editable Fields */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={formData.alt_text || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            alt_text: e.target.value,
                          }))
                        }
                        className="input-minimal"
                        placeholder="Describe the image..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Caption
                      </label>
                      <textarea
                        value={formData.caption || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            caption: e.target.value,
                          }))
                        }
                        className="input-minimal min-h-20 resize-none"
                        placeholder="Add a caption..."
                      />
                    </div>

                    {permissions.isEditor && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status || asset.status}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: e.target.value as "PENDING" | "APPROVED",
                            }))
                          }
                          className="input-minimal"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                        </select>
                      </div>
                    )}

                    {permissions.canManageFolders && folderList.length > 0 && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Folder
                        </label>
                        <select
                          value={formData.folder || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              folder: e.target.value || null,
                            }))
                          }
                          className="input-minimal"
                        >
                          <option value="">No folder</option>
                          {folderList.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.full_path}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {tagList.length > 0 && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {tagList.map((tag) => {
                            const isSelected = formData.tag_ids?.includes(
                              tag.id,
                            );
                            return (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  const currentTags = formData.tag_ids || [];
                                  setFormData((prev) => ({
                                    ...prev,
                                    tag_ids: isSelected
                                      ? currentTags.filter(
                                          (id) => id !== tag.id,
                                        )
                                      : [...currentTags, tag.id],
                                  }));
                                }}
                                className={`badge ${
                                  isSelected
                                    ? "badge-approved"
                                    : "badge-pending cursor-pointer hover:bg-secondary"
                                }`}
                              >
                                {tag.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Alt Text
                      </p>
                      <p className="text-sm">{asset.alt_text || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Caption
                      </p>
                      <p className="text-sm">{asset.caption || "—"}</p>
                    </div>

                    {asset.folder_name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Folder
                        </p>
                        <p className="text-sm">{asset.folder_name}</p>
                      </div>
                    )}

                    {asset.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {asset.tags.map((tag) => (
                            <span key={tag.id} className="badge badge-approved">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variants */}
                    {asset.variants.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Variants
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {asset.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="text-xs p-2 bg-secondary rounded border border-border"
                            >
                              <p className="font-medium">{variant.kind}</p>
                              {variant.width && (
                                <p className="text-muted-foreground">
                                  {variant.width} × {variant.height}
                                </p>
                              )}
                              {variant.size_bytes && (
                                <p className="text-muted-foreground">
                                  {formatFileSize(variant.size_bytes)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Snippets Tab */}
            {activeTab === "snippets" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">CDN URL</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={asset.cdn_url}
                      className="input-minimal flex-1 text-xs"
                    />
                    <button
                      onClick={() => handleCopy(asset.cdn_url)}
                      className="icon-btn"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Markdown</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`![${asset.alt_text || "image"}](${asset.cdn_url})`}
                      className="input-minimal flex-1 text-xs font-mono"
                    />
                    <button
                      onClick={() =>
                        handleCopy(
                          `![${asset.alt_text || "image"}](${asset.cdn_url})`,
                        )
                      }
                      className="icon-btn"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">HTML</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`<img src="${asset.cdn_url}" alt="${asset.alt_text || "image"}" />`}
                      className="input-minimal flex-1 text-xs font-mono"
                    />
                    <button
                      onClick={() =>
                        handleCopy(
                          `<img src="${asset.cdn_url}" alt="${asset.alt_text || "image"}" />`,
                        )
                      }
                      className="icon-btn"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-minimal flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  {asset.is_deleted ? (
                    canDelete && (
                      <button
                        onClick={handleRestore}
                        disabled={restoreMutation.isPending}
                        className="btn-primary flex-1"
                      >
                        <RefreshCwIcon className="w-4 h-4" />
                        {restoreMutation.isPending ? "Restoring..." : "Restore"}
                      </button>
                    )
                  ) : (
                    <>
                      {canEdit && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-minimal flex-1"
                        >
                          <Edit2Icon className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                          className="btn-destructive flex-1"
                        >
                          <Trash2Icon className="w-4 h-4" />
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
