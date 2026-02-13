"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAsset,
  useUpdateAsset,
  useDeleteAsset,
  useTags,
} from "@/hooks/useApi";
import { useFolders } from "@/hooks/useFolders";
import { useUser } from "@/contexts/UserContext";
import { NavigationDock } from "@/components/NavigationDock";
import { Badge } from "@/components/ui/badge";
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
import {
  Loader2,
  Download,
  Trash2,
  ChevronRight,
  AlertCircle,
  Save,
  X,
  Copy,
  FolderOpen,
  Code2,
  Check,
  Link2,
} from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import {
  IconUser,
  IconCalendar,
  IconFolder,
  IconFileText,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, permissions } = useUser();
  const assetId = params.id as string;

  const { data: asset, isLoading } = useAsset(assetId);
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();
  const { data: tags = [] } = useTags();
  const { data: folders = [] } = useFolders();

  // Editable fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    alt_text: "",
    caption: "",
    status: "PENDING",
    folder: null as string | null,
    tag_ids: [] as string[],
  });
  const [originalFolder, setOriginalFolder] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setEditData({
        alt_text: asset.alt_text || "",
        caption: asset.caption || "",
        status: asset.status,
        folder: asset.folder || null,
        tag_ids: asset.tags?.map((t) => t.id) || [],
      });
      setOriginalFolder(asset.folder || null);
    }
  }, [asset]);

  const handleSaveChanges = async () => {
    try {
      const updates: any = {
        alt_text: editData.alt_text,
        caption: editData.caption,
        status: editData.status,
        folder: editData.folder,
        tag_ids: editData.tag_ids,
      };

      await updateMutation.mutateAsync({
        id: assetId,
        updates,
      });

      // Show appropriate message based on folder change
      if (editData.folder !== originalFolder) {
        toast.success(`Asset moved to new folder`);
      } else {
        toast.success("Asset updated successfully");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update asset");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      await deleteMutation.mutateAsync(assetId);
      toast.success("Asset deleted successfully");
      router.push("/assets");
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const handleDownload = () => {
    if (asset?.cdn_url) {
      window.open(asset.cdn_url, "_blank");
    }
  };

  const copyToClipboard = (text: string, snippetName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetName);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Generate integration snippets
  const snippets = asset && {
    directLink: asset.cdn_url || "",
    markdown: `![${asset.alt_text || asset.filename_original}](${asset.cdn_url})`,
    html: `<img src="${asset.cdn_url}" alt="${asset.alt_text || asset.filename_original}" />`,
    htmlWithCaption: `<figure>
  <img src="${asset.cdn_url}" alt="${asset.alt_text || asset.filename_original}" />
  <figcaption>${asset.caption || ""}</figcaption>
</figure>`,
    json: JSON.stringify(
      {
        url: asset.cdn_url,
        alt: asset.alt_text || asset.filename_original,
        caption: asset.caption || null,
        filename: asset.filename_original,
        mimeType: asset.mime_type,
      },
      null,
      2,
    ),
    nextImage: `<Image
  src="${asset.cdn_url}"
  alt="${asset.alt_text || asset.filename_original}"
  width={${asset.width || 800}}
  height={${asset.height || 600}}
/>`,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        <NavigationDock user={user} onUploadClick={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        <NavigationDock user={user} onUploadClick={() => {}} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertCircle className="w-16 h-16 text-gray-300" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-3">
              Asset not found
            </p>
            <p className="text-gray-600 mb-8">
              The asset you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => router.push("/assets")}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Back to Assets
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isImage = asset.mime_type?.startsWith("image/");

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <NavigationDock user={user} />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-400 mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="py-8 mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-8">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-5 w-5 object-contain cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => router.push("/")}
              />
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <button
                onClick={() => router.push("/assets")}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Assets
              </button>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <span className="text-gray-900 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg truncate max-w-xs">
                {asset.filename_original}
              </span>
            </div>

            {/* Top Actions */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-1 tracking-tight">
                  Asset Details
                </h1>
              </div>
              <div className="flex gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        if (asset) {
                          setEditData({
                            alt_text: asset.alt_text || "",
                            caption: asset.caption || "",
                            status: asset.status,
                            folder: asset.folder || null,
                            tag_ids: asset.tags?.map((t) => t.id) || [],
                          });
                        }
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    {permissions.canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Preview Section */}
            <div className="lg:col-span-1">
              {/* Image Preview */}
              {isImage ? (
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={asset.cdn_url}
                    alt={asset.alt_text || asset.filename_original}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center h-48">
                  <IconFileText className="w-16 h-16 text-gray-300" />
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                  Status
                </p>
                {!isEditing ? (
                  <Badge
                    className={
                      asset.status === "APPROVED"
                        ? "bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-xs font-semibold"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 text-xs font-semibold"
                    }
                  >
                    {asset.status}
                  </Badge>
                ) : (
                  <Select
                    value={editData.status}
                    onValueChange={(value) =>
                      setEditData({ ...editData, status: value as any })
                    }
                  >
                    <SelectTrigger className="rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Pending
                        </span>
                      </SelectItem>
                      <SelectItem value="APPROVED">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Approved
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-3 space-y-6">
              {/* Edit Fields */}
              {isEditing ? (
                <div className="space-y-6">
                  {/* Alt Text */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Alt Text
                    </label>
                    <textarea
                      value={editData.alt_text}
                      onChange={(e) =>
                        setEditData({ ...editData, alt_text: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-blue-600 focus:outline-none transition-colors text-sm"
                      placeholder="Describe the image for accessibility..."
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Caption
                    </label>
                    <textarea
                      value={editData.caption}
                      onChange={(e) =>
                        setEditData({ ...editData, caption: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-blue-600 focus:outline-none transition-colors text-sm"
                      placeholder="Add a caption for this asset..."
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Status
                    </label>
                    <Select
                      value={editData.status}
                      onValueChange={(value) =>
                        setEditData({ ...editData, status: value as any })
                      }
                    >
                      <SelectTrigger className="rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            Pending
                          </span>
                        </SelectItem>
                        <SelectItem value="APPROVED">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Approved
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Folder Selection with Move Indicator */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Folder
                    </label>
                    <Select
                      value={editData.folder || "none"}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          folder: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger className="rounded-lg border-gray-200">
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            No Folder
                          </span>
                        </SelectItem>
                        {(Array.isArray(folders) ? folders : []).map(
                          (folder: any) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.full_path}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {editData.folder !== originalFolder && (
                      <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                        <Copy className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-700 font-medium">
                          This asset will be moved to the selected folder
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tags Selection */}
                  {tags.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">
                        Tags
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {tags.map((tag: any) => (
                          <label
                            key={tag.id}
                            className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          >
                            <Checkbox
                              checked={editData.tag_ids.includes(tag.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEditData({
                                    ...editData,
                                    tag_ids: [...editData.tag_ids, tag.id],
                                  });
                                } else {
                                  setEditData({
                                    ...editData,
                                    tag_ids: editData.tag_ids.filter(
                                      (id) => id !== tag.id,
                                    ),
                                  });
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              {tag.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filename Display */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                      Filename
                    </p>
                    <p className="text-gray-900 font-medium break-all">
                      {asset.filename_original}
                    </p>
                  </div>

                  {/* Alt Text Display */}
                  {asset.alt_text && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                        Alt Text
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {asset.alt_text}
                      </p>
                    </div>
                  )}

                  {/* Caption Display */}
                  {asset.caption && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                        Caption
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {asset.caption}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info Grid */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-xs font-semibold text-gray-500 uppercase block mb-4">
                  Information
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Type
                    </p>
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {asset.mime_type || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Size
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {formatFileSize(asset.size_bytes)}
                    </p>
                  </div>
                  {asset.width && asset.height && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          Width
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {asset.width}px
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          Height
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {asset.height}px
                        </p>
                      </div>
                    </>
                  )}
                  {asset.folder_name && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Folder
                      </p>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {asset.folder_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Uploaded by
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {asset.created_by_username}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Created
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {formatDate(asset.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase block mb-3">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 text-xs font-semibold"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {asset.variants && asset.variants.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase block mb-3">
                    Variants ({asset.variants.length})
                  </p>
                  <div className="space-y-2">
                    {asset.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-900 font-medium">
                          {variant.kind}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {variant.size_bytes
                            ? formatFileSize(variant.size_bytes)
                            : "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Integration Snippets */}
              {isImage && snippets && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-4 h-4 text-gray-600" />
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Integration Snippets
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Direct Link */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">
                          Direct Link
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(snippets.directLink, "directLink")
                          }
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedSnippet === "directLink" ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Copy
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                      <code className="block px-3 py-2 text-xs text-gray-700 break-all font-mono bg-white">
                        {snippets.directLink}
                      </code>
                    </div>

                    {/* Markdown */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">
                          Markdown
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(snippets.markdown, "markdown")
                          }
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedSnippet === "markdown" ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Copy
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                      <code className="block px-3 py-2 text-xs text-gray-700 break-all font-mono bg-white">
                        {snippets.markdown}
                      </code>
                    </div>

                    {/* HTML Image Tag */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">
                          HTML Image
                        </p>
                        <button
                          onClick={() => copyToClipboard(snippets.html, "html")}
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedSnippet === "html" ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Copy
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                      <code className="block px-3 py-2 text-xs text-gray-700 break-all font-mono bg-white">
                        {snippets.html}
                      </code>
                    </div>

                    {/* HTML with Caption */}
                    {asset.caption && (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-600">
                            HTML Figure
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                snippets.htmlWithCaption,
                                "htmlCaption",
                              )
                            }
                            className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {copiedSnippet === "htmlCaption" ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">
                                  Copied
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                  Copy
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block px-3 py-2 text-xs text-gray-700 break-all font-mono bg-white whitespace-pre-wrap">
                          {snippets.htmlWithCaption}
                        </code>
                      </div>
                    )}

                    {/* Next.js Image Component */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">
                          Next.js Image
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(snippets.nextImage, "nextImage")
                          }
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedSnippet === "nextImage" ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Copy
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                      <code className="block px-3 py-2 text-xs text-gray-700 break-all font-mono bg-white whitespace-pre-wrap">
                        {snippets.nextImage}
                      </code>
                    </div>

                    {/* JSON */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">
                          JSON Reference
                        </p>
                        <button
                          onClick={() => copyToClipboard(snippets.json, "json")}
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedSnippet === "json" ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Copy
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                      <code className="block px-3 py-2 text-xs text-gray-700 break-all font-mono bg-white whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {snippets.json}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Alt Text Extras */}
              {asset.alt_text && (
                <div className="border-t border-gray-200 pt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-900 uppercase mb-2">
                        Accessibility Info
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-blue-700 font-medium mb-1">
                            Alt Text:
                          </p>
                          <p className="text-sm text-blue-900 bg-white rounded px-3 py-2 border border-blue-200">
                            {asset.alt_text}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(asset.alt_text || "", "altText")
                          }
                          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          {copiedSnippet === "altText" ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-blue-700 font-medium">
                                Copy Alt Text
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
