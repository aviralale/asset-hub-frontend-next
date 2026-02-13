/**
 * RBAC Permission Utilities
 * Centralized permission checks based on user roles
 */

import { User, UserRole, PermissionCheck } from "./types";

/**
 * Get all permissions for a user based on their role
 */
export function getUserPermissions(user: User | null): PermissionCheck {
  if (!user) {
    return {
      canView: false,
      canUpload: false,
      canEdit: false,
      canDelete: false,
      canManageFolders: false,
      canManageTags: false,
      canViewAudit: false,
      isOwner: false,
      isAdmin: false,
      isEditor: false,
    };
  }

  const role = user.role;

  return {
    canView: true, // All authenticated users can view
    canUpload: ["OWNER", "ADMIN", "EDITOR", "UPLOADER"].includes(role),
    canEdit: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canDelete: ["OWNER", "ADMIN"].includes(role),
    canManageFolders: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canManageTags: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canViewAudit: ["OWNER", "ADMIN"].includes(role),
    isOwner: role === "OWNER",
    isAdmin: ["OWNER", "ADMIN"].includes(role),
    isEditor: ["OWNER", "ADMIN", "EDITOR"].includes(role),
  };
}

/**
 * Check if user can upload assets
 */
export function canUpload(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN", "EDITOR", "UPLOADER"].includes(user.role);
}

/**
 * Check if user can edit assets
 */
export function canEdit(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN", "EDITOR"].includes(user.role);
}

/**
 * Check if user can delete assets
 */
export function canDelete(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN"].includes(user.role);
}

/**
 * Check if user can update specific asset
 * Uploaders can only update their own assets
 */
export function canUpdateAsset(
  user: User | null,
  assetCreatorId: number,
): boolean {
  if (!user) return false;

  // Editors can update all
  if (["OWNER", "ADMIN", "EDITOR"].includes(user.role)) {
    return true;
  }

  // Uploaders can only update their own
  if (user.role === "UPLOADER") {
    return user.id === assetCreatorId;
  }

  return false;
}

/**
 * Check if user can manage folders
 */
export function canManageFolders(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN", "EDITOR"].includes(user.role);
}

/**
 * Check if user can manage tags
 */
export function canManageTags(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN", "EDITOR"].includes(user.role);
}

/**
 * Check if user can view audit logs
 */
export function canViewAudit(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN"].includes(user.role);
}

/**
 * Check if user is owner
 */
export function isOwner(user: User | null): boolean {
  if (!user) return false;
  return user.role === "OWNER";
}

/**
 * Check if user is admin (owner or admin)
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN"].includes(user.role);
}

/**
 * Check if user is editor (owner, admin, or editor)
 */
export function isEditor(user: User | null): boolean {
  if (!user) return false;
  return ["OWNER", "ADMIN", "EDITOR"].includes(user.role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    EDITOR: "Editor",
    UPLOADER: "Uploader",
    VIEWER: "Viewer",
  };
  return roleNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    OWNER: "Full system access with all permissions",
    ADMIN: "Manage all assets, folders, tags, and view audit logs",
    EDITOR: "Create, edit all assets, manage folders and tags",
    UPLOADER: "Upload and edit own assets, read-only for others",
    VIEWER: "Read-only access to all assets",
  };
  return descriptions[role];
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    OWNER: "red",
    ADMIN: "orange",
    EDITOR: "blue",
    UPLOADER: "green",
    VIEWER: "gray",
  };
  return colors[role];
}
