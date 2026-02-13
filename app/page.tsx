"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useAssets, useFolders, useTags } from "@/hooks/useApi";
import { NavigationDock } from "@/components/NavigationDock";
import { AssetCard } from "@/components/AssetCard";
import { Spinner } from "@/components/ui/spinner";
import { Loader2, FolderOpen, Tag, ChevronRight } from "lucide-react";
import { AssetMasonryGrid } from "@/components/AssetMasonryGrid";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useUser();
  const { data: assetsData, isLoading: assetsLoading } = useAssets({
    page: 1,
    page_size: 20,
  });
  const { data: foldersData } = useFolders();
  const { data: tagsData = [] } = useTags();

  useEffect(() => {
    // Redirect if auth check is complete and not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const assets = assetsData?.results || [];
  const folders = Array.isArray(foldersData) ? foldersData : [];
  const tags = Array.isArray(tagsData) ? tagsData : [];

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
                Home
              </span>
            </div>

            {/* Big Greeting with Doodles */}
            <div className="relative mb-12 py-12 px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl border border-gray-200 overflow-hidden">
              {/* Decorative Doodles */}
              <div className="absolute top-4 right-8 w-16 h-16 opacity-20">
                <svg viewBox="0 0 100 100" className="text-blue-500">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="50" cy="50" r="10" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 w-20 h-20 opacity-15">
                <svg viewBox="0 0 100 100" className="text-purple-500">
                  <path
                    d="M50,10 L90,90 L10,90 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  <circle
                    cx="50"
                    cy="60"
                    r="15"
                    fill="currentColor"
                    opacity="0.5"
                  />
                </svg>
              </div>
              <div className="absolute top-1/2 right-16 w-12 h-12 opacity-20">
                <svg viewBox="0 0 100 100" className="text-pink-500">
                  <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    rx="15"
                  />
                  <circle cx="35" cy="40" r="8" fill="currentColor" />
                  <circle cx="65" cy="40" r="8" fill="currentColor" />
                  <path
                    d="M30,70 Q50,85 70,70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="absolute bottom-12 right-1/4 w-10 h-10 opacity-25">
                <svg viewBox="0 0 100 100" className="text-yellow-500">
                  <path
                    d="M50,20 L60,45 L85,50 L60,55 L50,80 L40,55 L15,50 L40,45 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="absolute top-8 left-1/3 w-14 h-14 opacity-15">
                <svg viewBox="0 0 100 100" className="text-green-500">
                  <circle
                    cx="30"
                    cy="50"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <circle
                    cx="70"
                    cy="50"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    d="M25,50 L75,50"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="inline-block mb-4">
                  <span className="text-6xl">👋</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                  Welcome back,
                  <br />
                  <span className="bg-gradient-to-r from-blue-600  to-blue-900 bg-clip-text text-transparent">
                    {user?.first_name || user?.username || "there"}!
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Recent Assets - Masonry Grid */}
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
                Recent Assets
              </h2>
              <p className="text-sm text-gray-500">
                Your latest uploaded files in masonry layout
              </p>
            </div>

            {assetsLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : assets.length > 0 ? (
              <AssetMasonryGrid assets={assets} isLoading={false} />
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500">No assets yet</p>
              </div>
            )}
          </div>

          {/* Featured Folders - Summary Cards */}
          {folders.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
                  Folders
                </h2>
                <p className="text-sm text-gray-500">
                  Organize and manage your asset folders
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.slice(0, 6).map((folder) => (
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

          {/* Featured Tags - Summary Items */}
          {tags.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
                  Tags
                </h2>
                <p className="text-sm text-gray-500">
                  Quick access to your asset tags
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-wrap gap-3">
                  {tags.slice(0, 8).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => router.push("/assets?tag=" + tag.id)}
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
        </div>
      </main>
    </div>
  );
}
