"use client";

/**
 * Asset Card Component - Nothing Phone Design
 * Minimal card displaying asset with role-based actions
 */

import { forwardRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { canUpdateAsset } from "@/lib/permissions";
import {
  formatFileSize,
  formatRelativeTime,
  getFileExtension,
} from "@/lib/utils";
import {
  ImageIcon,
  FileIcon,
  Edit2Icon,
  Trash2Icon,
  CheckCircle2Icon,
} from "lucide-react";
import type { AssetListItem } from "@/lib/types";

interface AssetCardProps {
  asset: AssetListItem;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const AssetCard = forwardRef<HTMLDivElement, AssetCardProps>(
  ({ asset, onClick, onEdit, onDelete }, ref) => {
    const { user, permissions } = useUser();

    const canEdit = user && canUpdateAsset(user, asset.created_by);
    const canDelete = permissions.canDelete;

    const isImage = asset.mime_type.startsWith("image/");
    const extension = getFileExtension(asset.filename_original);

    return (
      <div
        ref={ref}
        className="group nothing-card hover-lift cursor-pointer flex flex-col"
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-3">
          {isImage ? (
            <img
              src={asset.cdn_url}
              alt={asset.alt_text || asset.filename_original}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            {asset.status === "APPROVED" ? (
              <div className="badge badge-approved backdrop-blur-sm">
                <CheckCircle2Icon className="w-3 h-3" />
                Approved
              </div>
            ) : (
              <div className="badge badge-pending backdrop-blur-sm">
                <div className="dot dot-gray" />
                Pending
              </div>
            )}
          </div>

          {/* Deleted Indicator */}
          {asset.is_deleted && (
            <div className="absolute top-2 right-2">
              <div className="badge bg-destructive/10 text-destructive backdrop-blur-sm">
                Deleted
              </div>
            </div>
          )}

          {/* Quick Actions (show on hover) */}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="icon-btn bg-background/90 backdrop-blur-sm"
                title="Edit"
              >
                <Edit2Icon className="w-4 h-4" />
              </button>
            )}

            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="icon-btn bg-background/90 backdrop-blur-sm hover:border-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          {/* Filename */}
          <p
            className="font-medium text-sm truncate"
            title={asset.filename_original}
          >
            {asset.filename_original}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{extension}</span>
            <div className="dot dot-gray" />
            <span>{formatFileSize(asset.size_bytes)}</span>
            {asset.width && asset.height && (
              <>
                <div className="dot dot-gray" />
                <span>
                  {asset.width} × {asset.height}
                </span>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span className="truncate">by {asset.created_by_username}</span>
            <span className="shrink-0">
              {formatRelativeTime(asset.created_at)}
            </span>
          </div>

          {/* Tags Count */}
          {asset.tag_count > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">
                {asset.tag_count} {asset.tag_count === 1 ? "tag" : "tags"}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

AssetCard.displayName = "AssetCard";
