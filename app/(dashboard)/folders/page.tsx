"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  useFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
} from "@/hooks/useFolders";
import { useUser } from "@/contexts/UserContext";
import { Folder } from "@/lib/types";
import { NavigationDock } from "@/components/NavigationDock";
import { toast } from "sonner";
import {
  Trash2,
  Folder as FolderIcon,
  Plus,
  Loader2,
  Home,
  ChevronRight,
} from "lucide-react";

export default function FoldersPage() {
  const router = useRouter();
  const { user, permissions } = useUser();
  const { data: folders = [], isLoading } = useFolders();
  const createMutation = useCreateFolder();
  const updateMutation = useUpdateFolder();
  const deleteMutation = useDeleteFolder();

  // Ensure folders is always an array
  const folderList = Array.isArray(folders) ? folders : [];

  const [folderName, setFolderName] = useState("");
  const [parentFolder, setParentFolder] = useState<string>("root");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: folderName,
        parent: parentFolder === "root" ? undefined : parentFolder,
      });
      toast.success("Folder created");
      setFolderName("");
      setParentFolder("root");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      if (!confirm("Delete this folder?")) return;
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Folder deleted");
      } catch (error) {
        toast.error("Failed to delete folder");
      }
    },
    [deleteMutation],
  );

  const canManage = permissions.canManageFolders;
  const canDelete = permissions.canDelete; // Only OWNER and ADMIN can delete

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <NavigationDock user={user} />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-400 mx-auto px-6 md:px-12">
          {/* macOS-style Header */}
          <div className="py-8 mb-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-8">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-5 w-5 object-contain cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => router.push("/")}
              />
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <span className="text-gray-900 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                Folders
              </span>
            </div>

            {/* Title and Action Button */}
            <div className="flex items-start justify-between gap-6 mb-2">
              <div>
                <h1 className="text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                  Folders
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
                  Organize your assets into folders and subfolders to keep
                  everything organized and accessible
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </button>
              )}
            </div>
          </div>

          {/* Folders Grid Header */}
          {folderList.length > 0 && (
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 tracking-tight">
                All Folders
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {folderList.length}{" "}
                {folderList.length === 1 ? "folder" : "folders"}
              </span>
            </div>
          )}

          {/* Folders Grid */}
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : folderList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {folderList.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => router.push(`/folders/${folder.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                    {/* Icon and Title Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100 transition-all">
                          <FolderIcon className="w-7 h-7 text-blue-600" />
                        </div>
                      </div>
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      )}
                    </div>

                    {/* Folder Name */}
                    <h3 className="font-semibold text-gray-900 mb-3 text-base truncate group-hover:text-blue-600 transition-colors">
                      {folder.name && folder.name.trim() ? (
                        folder.name
                      ) : (
                        <span className="text-gray-400 italic">
                          Unnamed Folder
                        </span>
                      )}
                    </h3>

                    {/* Folder Path and Date */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <code className="px-2.5 py-1.5 bg-gray-50 rounded-lg text-gray-600 font-mono truncate flex-1">
                          {folder.full_path || folder.id}
                        </code>
                      </div>
                      {folder.created_at && (
                        <span className="text-gray-500">
                          Created{" "}
                          {new Date(folder.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-8 shadow-inner">
                <FolderIcon className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                No folders yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
                Create your first folder to start organizing your assets and
                keeping everything in order
              </p>
              {canManage && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create First Folder
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Create New Folder
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2 font-normal">
              Organize your assets with hierarchical folders. Folders can have
              subfolders to create a nested structure.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Folder Name */}
            <div className="space-y-2">
              <label
                htmlFor="folder-name"
                className="text-sm font-semibold text-gray-900 block"
              >
                Name
              </label>
              <Input
                id="folder-name"
                placeholder="e.g., Products, Blog Posts"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 bg-gray-50 px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-500">
                Give your folder a descriptive name (e.g., "2026 Assets",
                "Client Work")
              </p>
            </div>

            {/* Parent Folder */}
            <div className="space-y-2">
              <label
                htmlFor="parent-folder"
                className="text-sm font-semibold text-gray-900 block"
              >
                Parent Folder
              </label>
              <Select value={parentFolder} onValueChange={setParentFolder}>
                <SelectTrigger
                  id="parent-folder"
                  className="rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 bg-gray-50 px-4 py-2.5 text-sm"
                >
                  <SelectValue placeholder="Root level (no parent)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-gray-400" />
                      Root Level
                    </div>
                  </SelectItem>
                  {folderList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <FolderIcon className="w-4 h-4 text-blue-600" />
                        {f.full_path}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select a parent folder to create a nested structure, or leave as
                root level for a top-level folder
              </p>
            </div>

            {/* Info Box */}
            {parentFolder !== "root" && (
              <div className="px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">
                  ✓ This folder will be nested under the selected parent
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setFolderName("");
                setParentFolder("root");
              }}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={createMutation.isPending || !folderName}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
