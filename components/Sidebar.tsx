"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/lib/types";
import { GridIcon, ListIcon } from "./Icons";

interface SidebarProps {
  tags: Tag[];
  quickFilterActive: string;
  onQuickFilterChange: (filter: string) => void;
  selectedTag?: string;
  onTagSelect: (tagId: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function Sidebar({
  tags,
  quickFilterActive,
  onQuickFilterChange,
  selectedTag,
  onTagSelect,
  viewMode,
  onViewModeChange,
}: SidebarProps) {
  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <Card className="p-3">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => onViewModeChange("grid")}
            className="flex-1"
          >
            <GridIcon className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => onViewModeChange("list")}
            className="flex-1"
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Quick Filters */}
      <Card className="p-3">
        <p className="text-sm font-semibold mb-3">Quick Filters</p>
        <div className="space-y-2">
          {["all", "images", "pending", "approved", "deleted"].map((filter) => (
            <Button
              key={filter}
              className="w-full justify-start"
              variant={quickFilterActive === filter ? "default" : "outline"}
              onClick={() => onQuickFilterChange(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Tags */}
      {tags.length > 0 && (
        <Card className="p-3">
          <p className="text-sm font-semibold mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onTagSelect(selectedTag === tag.id ? "" : tag.id)
                }
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Help */}
      <Card className="p-3 bg-blue-50">
        <p className="text-xs font-medium text-blue-900 mb-2">💡 Tip</p>
        <p className="text-xs text-blue-800">
          Use filters and search to find assets quickly. Upload requires edit
          permissions.
        </p>
      </Card>
    </div>
  );
}
