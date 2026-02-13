"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useFolder,
  useUpdateFolder,
  useDeleteFolder,
} from "@/hooks/useFolders";
import { useAssets } from "@/hooks/useAssets";
import { useUser } from "@/contexts/UserContext";
import { NavigationDock } from "@/components/NavigationDock";
import { AssetCard } from "@/components/AssetCard";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Folder as FolderIcon,
  ChevronRight,
  Home,
  Loader2,
  Grid3x3,
  FolderOpen,
  Trash2,
  Save,
  X,
} from "lucide-react";

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.id as string;

  const { user, permissions } = useUser();
  const { data: folder, isLoading: folderLoading } = useFolder(folderId);
  const { data: assetsData, isLoading: assetsLoading } = useAssets({
    folder: folderId,
    page_size: 100,
  });
  const updateMutation = useUpdateFolder();
  const deleteMutation = useDeleteFolder();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (folder) {
      setEditName(folder.name || "");
    }
  }, [folder]);

  const handleSaveChanges = async () => {
    if (!editName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: folderId,
        data: {
          name: editName,
        },
      });
      toast.success("Folder updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update folder");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this folder? All contents will be preserved.",
      )
    )
      return;

    try {
      await deleteMutation.mutateAsync(folderId);
      toast.success("Folder deleted successfully");
      router.push("/folders");
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const assets = assetsData?.results || [];
  const pathParts = folder?.full_path.split("/").filter(Boolean) || [];

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <NavigationDock user={user} />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-400 mx-auto px-6 md:px-12">
          {/* macOS-style Header */}
          <div className="py-8 mb-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-6">
              <button
                onClick={() => router.push("/")}
                className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 hover:bg-gray-100 rounded-lg px-2 py-1"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </button>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <button
                onClick={() => router.push("/folders")}
                className="text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-lg px-2 py-1 font-medium"
              >
                Folders
              </button>
              {pathParts.map((part, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  <span
                    className={
                      index === pathParts.length - 1
                        ? "text-gray-900 font-semibold bg-gray-100 px-2 py-1 rounded-lg"
                        : "text-gray-500 px-2 py-1"
                    }
                  >
                    {part}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {folderLoading ? (
              <div className="flex items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-gray-300" />
              </div>
            ) : folder ? (
              <>
                <div className="flex items-start justify-between gap-6 mb-4">
                  <div className="flex items-center gap-6 flex-1">
                    {/* macOS-style Folder Icon */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 via-blue-400 to-blue-300 shadow-lg flex items-center justify-center">
                        <FolderOpen className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                        <Grid3x3 className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>

                    {/* Folder Info */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-3xl font-semibold mb-3 border-blue-600"
                          autoFocus
                        />
                      ) : (
                        <h1 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight truncate">
                          {folder.name}
                        </h1>
                      )}
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-gray-700">
                          <code className="text-xs font-mono">
                            {folder.full_path}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-blue-700 font-medium">
                          <Grid3x3 className="w-3.5 h-3.5" />
                          <span>
                            {assets.length}{" "}
                            {assets.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        {folder.created_at && (
                          <span className="text-gray-500 text-xs">
                            Created{" "}
                            {new Date(folder.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setEditName(folder.name || "");
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
                        {permissions.canManageFolders && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium text-sm"
                          >
                            Edit
                          </button>
                        )}
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
              </>
            ) : null}
          </div>

          {/* Assets Grid */}
          {assetsLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : assets.length > 0 ? (
            <>
              {/* macOS Finder-style Section Header */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 tracking-tight">
                  Contents
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  {assets.length} {assets.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Masonry Grid with macOS spacing */}
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-5">
                {assets.map((asset) => (
                  <div key={asset.id} className="break-inside-avoid mb-5">
                    <AssetCard asset={asset} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-8 shadow-inner">
                <FolderIcon className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                Empty Folder
              </h3>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                This folder doesn't contain any items yet. Upload assets and
                assign them to this folder to get started.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
