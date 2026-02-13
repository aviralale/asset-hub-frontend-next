"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useAssets, useFolders, useTags } from "@/hooks/useApi";
import { AssetListItem, AssetFilters, AssetStatus } from "@/lib/types";
import { NavigationDock } from "@/components/NavigationDock";
import { Sidebar } from "@/components/Sidebar";
import { FolderTree } from "@/components/FolderTree";
import { FiltersBar } from "@/components/FiltersBar";
import { AssetMasonryGrid } from "@/components/AssetMasonryGrid";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2, ChevronRight, AlertCircle } from "lucide-react";

const PAGE_SIZE = 20;

export default function AssetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user, permissions } = useUser();
  const { data: folders = [], isLoading: loadingFolders } = useFolders();
  const { data: tags = [], isLoading: loadingTags } = useTags();

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [allAssets, setAllAssets] = useState<AssetListItem[]>([]);

  // Filters from URL
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const folder = searchParams.get("folder") || "";
  const tag = searchParams.get("tag") || "";
  const deleted = searchParams.get("deleted") === "true";
  const quickFilter = searchParams.get("quickFilter") || "all";

  // Build asset filters
  const assetFilters: AssetFilters = useMemo(() => {
    const filters: AssetFilters = {
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
    };

    if (status) filters.status = status as AssetStatus;
    if (folder) filters.folder = folder;
    if (tag) filters.tag = tag;

    if (quickFilter === "images") filters.type = "image";
    if (quickFilter === "pending") filters.status = "PENDING";
    if (quickFilter === "approved") filters.status = "APPROVED";
    if (quickFilter === "deleted") filters.deleted = true;
    else if (quickFilter !== "all") filters.deleted = false;

    return filters;
  }, [page, search, status, folder, tag, quickFilter]);

  const { data: assetsResponse, isLoading, error } = useAssets(assetFilters);

  // Debug logging
  React.useEffect(() => {
    console.log("Assets Query State:", {
      isLoading,
      hasData: !!assetsResponse,
      resultsCount: assetsResponse?.results?.length,
      totalCount: assetsResponse?.count,
      page,
      filters: assetFilters,
      error: error?.message,
    });
  }, [assetsResponse, isLoading, error, page, assetFilters]);

  // Reset page when filters change (but not when page changes)
  React.useEffect(() => {
    setPage(1);
  }, [search, status, folder, tag, quickFilter]);

  // Accumulate assets for infinite scroll
  React.useEffect(() => {
    if (assetsResponse?.results) {
      if (page === 1) {
        // For first page, replace all assets
        setAllAssets(assetsResponse.results);
      } else {
        // For subsequent pages, append to existing
        setAllAssets((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((a) => a.id));
          const newAssets = assetsResponse.results.filter(
            (a) => !existingIds.has(a.id),
          );
          return [...prev, ...newAssets];
        });
      }
    } else if (page === 1 && !isLoading) {
      // If no results and not loading, clear the array
      setAllAssets([]);
    }
  }, [assetsResponse, page, isLoading]);

  const hasMore = assetsResponse
    ? page * PAGE_SIZE < assetsResponse.count
    : false;

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((p) => p + 1);
    }
  }, [isLoading, hasMore]);

  const handleSearchChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("search", value);
      } else {
        newParams.delete("search");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("status", value);
      } else {
        newParams.delete("status");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  const handleQuickFilterChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        newParams.set("quickFilter", value);
      } else {
        newParams.delete("quickFilter");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  const handleFolderSelect = useCallback(
    (folderPath: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (folderPath) {
        newParams.set("folder", folderPath);
      } else {
        newParams.delete("folder");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  const handleTagSelect = useCallback(
    (tagId: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (tagId) {
        newParams.set("tag", tagId);
      } else {
        newParams.delete("tag");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  const handleClearFilters = useCallback(() => {
    window.history.pushState(null, "", "/assets");
  }, []);

  const handleDeletedChange = useCallback(
    (value: boolean) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("deleted", "true");
      } else {
        newParams.delete("deleted");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("type", value);
      } else {
        newParams.delete("type");
      }
      window.history.pushState(null, "", `?${newParams.toString()}`);
    },
    [searchParams],
  );

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        {/* Navigation Dock */}
        <NavigationDock user={user} />

        {/* Main Content */}
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
                  Assets
                </span>
              </div>

              {/* Title and Description */}
              <div className="mb-8">
                <h1 className="text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                  Assets
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
                  Explore and manage your digital assets. Search, filter, and
                  organize by status, type, folder, or tags to find exactly what
                  you need.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <input
                  type="text"
                  placeholder="Search by name, description..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-5 py-3 text-sm rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-blue-600 focus:outline-none transition-colors bg-white hover:border-gray-300 placeholder-gray-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickFilterChange("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    quickFilter === "all"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleQuickFilterChange("images")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    quickFilter === "images"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  Images
                </button>
                <button
                  onClick={() => handleQuickFilterChange("approved")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    quickFilter === "approved"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => handleQuickFilterChange("pending")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    quickFilter === "pending"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  Pending
                </button>

                {(search || quickFilter !== "all" || folder || tag) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Assets Masonry Grid */}
            {(page === 1 && isLoading) ||
            (page === 1 && allAssets.length === 0 && !error) ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertCircle className="w-16 h-16 text-gray-300" />
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-2">
                  Error loading assets
                </p>
                <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
                  {error.message || "An unknown error occurred"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Retry
                </button>
              </div>
            ) : (
              <AssetMasonryGrid
                assets={allAssets}
                isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
