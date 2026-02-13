"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Asset, AssetListItem } from "@/lib/types";
import { formatFileSize, formatDate } from "@/lib/utils";
import { IconUser, IconCalendar, IconFolder } from "@tabler/icons-react";

interface AssetCardProps {
  asset?: Asset | AssetListItem;
  isLoading?: boolean;
  onClick?: () => void;
}

export function AssetCard({ asset, isLoading, onClick }: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-2xl shadow-sm">
        <div
          className="w-full bg-gray-100 animate-pulse"
          style={{ aspectRatio: "1" }}
        />
      </div>
    );
  }

  if (!asset) return null;

  // Check if it's an image from mime_type
  const isImage = asset.mime_type?.startsWith("image/");

  // Calculate aspect ratio from image dimensions or use natural image ratio
  const aspectRatio =
    asset.width && asset.height ? asset.width / asset.height : undefined;

  // Handle tag count - AssetListItem has tag_count, Asset has tags array
  const tagCount =
    "tag_count" in asset
      ? asset.tag_count
      : "tags" in asset
        ? asset.tags?.length
        : 0;

  return (
    <div
      className="w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full bg-gray-50 overflow-hidden">
        {isImage ? (
          <img
            src={asset.cdn_url}
            alt={asset.alt_text || asset.filename_original}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            style={aspectRatio ? { aspectRatio: aspectRatio } : undefined}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center bg-gray-100"
            style={{ aspectRatio: "1" }}
          >
            <span className="text-4xl">📄</span>
          </div>
        )}
        {asset.is_deleted && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Deleted</span>
          </div>
        )}

        {/* Hover Overlay with Details */}
        <div
          className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-1.5">
            <p className="text-sm font-medium line-clamp-1">
              {asset.filename_original}
            </p>
            <div className="flex items-center gap-3 text-xs opacity-90">
              <div className="flex items-center gap-1">
                <IconUser className="w-3.5 h-3.5" />
                <span>{asset.created_by_username}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconCalendar className="w-3.5 h-3.5" />
                <span>{formatDate(asset.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
