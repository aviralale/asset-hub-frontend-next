"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useAssets, useFolders, useTags } from "@/hooks/useApi";
import { NavigationDock } from "@/components/NavigationDock";
import { Badge } from "@/components/ui/badge";
import { AssetCard } from "@/components/AssetCard";
import {
  Loader2,
  FolderOpen,
  Tag,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { data: assetsData, isLoading: assetsLoading } = useAssets({
    page_size: 8,
  });
  const { data: foldersData } = useFolders();
  const { data: tagsData = [] } = useTags();

  const assets = assetsData?.results || [];
  const folders = Array.isArray(foldersData) ? foldersData : [];
  const tags = Array.isArray(tagsData) ? tagsData : [];

  const featuredFolders = folders.slice(0, 5);
  const featuredTags = tags.slice(0, 6);

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <NavigationDock user={user} />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-400 mx-auto px-6 md:px-12">
          {/* Welcome Section */}
          <div className="py-8 mb-8">
            <div className="mb-8">
              <h1 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
                Welcome back, {user?.first_name || user?.username || "there"}!
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome to Ctrl Bits — Your centralized asset management hub.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                  Total Assets
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {assetsData?.count || 0}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                  Folders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {folders.length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
                  Tags
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tags.length}
                </p>
              </div>
            </div>
          </div>

          {/* Featured Assets */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  Recent Assets
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your latest uploaded files
                </p>
              </div>
              <button
                onClick={() => router.push("/assets")}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {assetsLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : assets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id}>
                    <AssetCard asset={asset} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500">No assets yet</p>
              </div>
            )}
          </div>

          {/* Featured Folders */}
          {featuredFolders.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    Folders
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Organize your assets
                  </p>
                </div>
                <button
                  onClick={() => router.push("/folders")}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => router.push(`/folders/${folder.id}`)}
                    className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100 transition-all">
                        <FolderOpen className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {folder.full_path}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured Tags */}
          {featuredTags.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    Tags
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Quick access to your tags
                  </p>
                </div>
                <button
                  onClick={() => router.push("/tags")}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-wrap gap-3">
                  {featuredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => router.push("/assets?tags=" + tag.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full border border-purple-200 hover:shadow-md hover:border-purple-300 transition-all font-medium text-sm"
                    >
                      <Tag className="w-4 h-4" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/assets")}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">📸</div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  View All Assets
                </h3>
                <p className="text-sm text-gray-500">
                  Browse your complete asset library
                </p>
              </button>

              <button
                onClick={() => router.push("/folders")}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">📁</div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Manage Folders
                </h3>
                <p className="text-sm text-gray-500">
                  Organize and create folders
                </p>
              </button>

              <button
                onClick={() => router.push("/tags")}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">🏷️</div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Manage Tags
                </h3>
                <p className="text-sm text-gray-500">Create and manage tags</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
