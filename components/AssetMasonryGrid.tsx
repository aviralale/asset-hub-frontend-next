"use client";

import React from "react";
import { useInView } from "react-intersection-observer";
import { Asset, AssetListItem } from "@/lib/types";
import { AssetCard } from "./AssetCard";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AssetMasonryGridProps {
  assets: (Asset | AssetListItem)[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function AssetMasonryGrid({
  assets,
  isLoading,
  hasMore,
  onLoadMore,
}: AssetMasonryGridProps) {
  const router = useRouter();
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  React.useEffect(() => {
    if (inView && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  if (assets.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4 opacity-40">📦</div>
        <p className="text-xl font-medium text-gray-900">No assets found</p>
        <p className="text-sm text-gray-500 mt-2">
          Try adjusting your search or upload new assets
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Pure CSS Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="break-inside-avoid mb-6">
            <AssetCard
              asset={asset}
              onClick={() => router.push(`/assets/${asset.id}`)}
            />
          </div>
        ))}
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={`loading-${i}`} className="break-inside-avoid mb-6">
              <AssetCard isLoading />
            </div>
          ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div
          ref={ref}
          className="flex justify-center items-center py-12 w-full"
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
