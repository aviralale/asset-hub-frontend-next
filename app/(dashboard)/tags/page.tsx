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
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/useTags";
import { useUser } from "@/contexts/UserContext";
import { NavigationDock } from "@/components/NavigationDock";
import { toast } from "sonner";
import {
  Trash2,
  Tag as TagIcon,
  Plus,
  Loader2,
  ChevronRight,
} from "lucide-react";

export default function TagsPage() {
  const router = useRouter();
  const { user, permissions } = useUser();
  const { data: tags = [], isLoading } = useTags();
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();

  const tagList = Array.isArray(tags) ? tags : [];

  const [tagName, setTagName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateTag = async () => {
    if (!tagName) {
      toast.error("Please enter a tag name");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: tagName,
      });
      toast.success("Tag created");
      setTagName("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  const handleDeleteTag = useCallback(
    async (id: string) => {
      if (!confirm("Delete this tag?")) return;
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Tag deleted");
      } catch (error) {
        toast.error("Failed to delete tag");
      }
    },
    [deleteMutation],
  );

  const canManage = permissions.canManageTags;

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
                Tags
              </span>
            </div>

            {/* Title and Action Button */}
            <div className="flex items-start justify-between gap-6 mb-2">
              <div>
                <h1 className="text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                  Tags
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
                  Organize and categorize your assets with tags. Use tags to
                  label assets by type, project, status, or any other
                  classification system.
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

          {/* Tags Grid Header */}
          {tagList.length > 0 && (
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 tracking-tight">
                All Tags
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {tagList.length} {tagList.length === 1 ? "tag" : "tags"}
              </span>
            </div>
          )}

          {/* Tags Grid */}
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : tagList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {tagList.map((tag) => (
                <div key={tag.id} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                    {/* Icon and Delete Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-100 transition-all">
                          <TagIcon className="w-7 h-7 text-purple-600" />
                        </div>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      )}
                    </div>

                    {/* Tag Name */}
                    <h3 className="font-semibold text-gray-900 mb-3 text-base truncate group-hover:text-purple-600 transition-colors">
                      {tag.name && tag.name.trim() ? (
                        tag.name
                      ) : (
                        <span className="text-gray-400 italic">
                          Unnamed Tag
                        </span>
                      )}
                    </h3>

                    {/* Tag ID and Date */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <code className="px-2.5 py-1.5 bg-gray-50 rounded-lg text-gray-600 font-mono truncate">
                          {tag.id}
                        </code>
                      </div>
                      {tag.created_at && (
                        <span className="text-gray-500">
                          Created{" "}
                          {new Date(tag.created_at).toLocaleDateString(
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
                <TagIcon className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                No tags yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
                Create your first tag to start organizing and categorizing your
                assets
              </p>
              {canManage && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create First Tag
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Tag Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Create New Tag
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2 font-normal">
              Create a tag to organize and label your assets. Tags help you
              quickly find and group related content.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tag Name */}
            <div className="space-y-2">
              <label
                htmlFor="tag-name"
                className="text-sm font-semibold text-gray-900 block"
              >
                Tag Name
              </label>
              <Input
                id="tag-name"
                placeholder="e.g., Featured, Client Approved"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 bg-gray-50 px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-500">
                Use clear, descriptive tag names (e.g., "Q1-2026", "High
                Priority", "Client Review")
              </p>
            </div>

            {/* Info Box */}
            <div className="px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">
                ✓ You can update tag assignments on individual assets after
                creation
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setTagName("");
              }}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={createMutation.isPending || !tagName}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
