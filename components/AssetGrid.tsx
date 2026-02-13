"use client";

import React from "react";
import { Asset, AssetListItem } from "@/lib/types";
import { AssetCard } from "./AssetCard";

interface AssetGridProps {
  assets: (Asset | AssetListItem)[];
  isLoading?: boolean;
  onSelectAsset: (asset: Asset | AssetListItem) => void;
}

export function AssetGrid({
  assets,
  isLoading,
  onSelectAsset,
}: AssetGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <AssetCard isLoading />
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <p className="text-lg font-medium text-gray-700">No assets found</p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or upload new assets
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {assets.map((asset) => (
        <div key={asset.id}>
          <AssetCard asset={asset} onClick={() => onSelectAsset(asset)} />
        </div>
      ))}
    </div>
  );
}
