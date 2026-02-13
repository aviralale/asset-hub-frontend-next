"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FiltersBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  status?: string;
  onStatusChange: (status: string) => void;
  type?: string;
  onTypeChange: (type: string) => void;
  deleted?: boolean;
  onDeletedChange: (deleted: boolean) => void;
  onClearFilters: () => void;
}

export function FiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  deleted,
  onDeletedChange,
  onClearFilters,
}: FiltersBarProps) {
  const hasActiveFilters = search || status || type || deleted;

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
        <Input
          placeholder="Search assets by name, filename, or metadata..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filters:</span>
        </div>
        
        <Select value={status || ""} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type || ""} onValueChange={onTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="document">Document</SelectItem>
          </SelectContent>
        </Select>

        {/* Deleted filter */}
        <Button
          variant={deleted ? "default" : "outline"}
          size="sm"
          onClick={() => onDeletedChange(!deleted)}
          className="gap-2"
        >
          {deleted ? "✓ Deleted" : "Show Deleted"}
        </Button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto text-gray-600 hover:text-gray-900"
          >
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
