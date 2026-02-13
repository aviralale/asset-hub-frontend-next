"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Folder } from "@/lib/types";
import { ChevronDownIcon } from "./Icons";

interface FolderTreeProps {
  folders: Folder[];
  selectedFolder?: string;
  onSelectFolder: (folderId: string) => void;
}

interface FolderNodeData extends Folder {
  children: FolderNodeData[];
}

function buildFolderHierarchy(
  folders: Folder[],
  parentId: string | null = null,
): FolderNodeData[] {
  return folders
    .filter((f) => f.parent === parentId)
    .map((folder) => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id),
    }));
}

function FolderNode({
  folder,
  selectedFolder,
  onSelectFolder,
}: {
  folder: FolderNodeData;
  selectedFolder?: string;
  onSelectFolder: (folderId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer ${
          selectedFolder === folder.id ? "bg-blue-100" : ""
        }`}
        onClick={() => {
          onSelectFolder(folder.id);
          if (hasChildren) setExpanded(!expanded);
        }}
      >
        {hasChildren && (
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
        <span className="text-sm flex-1">{folder.name}</span>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4">
          {folder.children.map((child: FolderNodeData) => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({
  folders,
  selectedFolder,
  onSelectFolder,
}: FolderTreeProps) {
  const folderList = Array.isArray(folders) ? folders : [];

  // Build hierarchical structure from flat folder list
  const rootFolders = useMemo(
    () => buildFolderHierarchy(folderList),
    [folderList],
  );

  return (
    <Card className="bg-white">
      <div className="p-3">
        <p className="text-sm font-semibold mb-3">Folders</p>
        <div className="space-y-1">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer ${
              selectedFolder === "" ? "bg-blue-100" : ""
            }`}
            onClick={() => onSelectFolder("")}
          >
            <span className="text-sm">All Folders</span>
          </div>
          {rootFolders.map((folder) => (
            <FolderNode
              key={folder.id}
              folder={folder}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
