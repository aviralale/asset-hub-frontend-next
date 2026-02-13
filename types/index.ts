// User and Auth Types
export type UserRole = "OWNER" | "ADMIN" | "EDITOR" | "UPLOADER" | "VIEWER";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Asset Types
export type AssetStatus = "PENDING" | "APPROVED";
export type VariantKind =
  | "ORIGINAL"
  | "THUMB"
  | "MD"
  | "LG"
  | "WEBP_THUMB"
  | "WEBP_MD"
  | "WEBP_LG";

export interface AssetVariant {
  id: string;
  kind: VariantKind;
  storage_key: string;
  cdn_url: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent: string | null;
  full_path: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  filename_original: string;
  storage_key: string;
  cdn_url: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  sha256: string | null;
  alt_text: string;
  caption: string;
  status: AssetStatus;
  folder: string | null;
  folder_name: string | null;
  tags: Tag[];
  tag_ids?: string[];
  variants: AssetVariant[];
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  is_image: boolean;
}

export interface AssetListItem {
  id: string;
  filename_original: string;
  cdn_url: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  status: AssetStatus;
  folder: string | null;
  folder_name: string | null;
  tag_count: number;
  created_by: string;
  created_by_username: string;
  created_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface AssetUpdateData {
  alt_text?: string;
  caption?: string;
  status?: AssetStatus;
  folder?: string | null;
  tag_ids?: string[];
}

// Upload Types
export interface PresignRequest {
  filename: string;
  content_type: string;
  folder?: string;
  size_bytes?: number;
}

export interface PresignResponse {
  upload_url: string;
  storage_key: string;
  required_headers: Record<string, string>;
  public_cdn_url: string;
}

export interface CompleteUploadRequest {
  storage_key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  folder?: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  actor: number | null;
  actor_username: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Filter and Pagination Types
export interface AssetFilters {
  search?: string;
  tag?: string;
  folder?: string;
  type?: string;
  status?: AssetStatus;
  deleted?: boolean;
  page?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error Types
export interface ApiError {
  error: string;
  detail: string | Record<string, any>;
  status_code: number;
}

// Permission helpers based on RBAC
export interface RBACPermissions {
  canView: boolean;
  canUpload: boolean;
  canEdit: boolean;
  canEditAll: boolean;
  canApprove: boolean;
  canDelete: boolean;
  canManageFolders: boolean;
  canManageTags: boolean;
  canViewAudit: boolean;
  canManageUsers: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

export function getUserPermissions(role: UserRole): RBACPermissions {
  const permissions: RBACPermissions = {
    canView: true, // All authenticated users
    canUpload: ["OWNER", "ADMIN", "EDITOR", "UPLOADER"].includes(role),
    canEdit: ["OWNER", "ADMIN", "EDITOR", "UPLOADER"].includes(role),
    canEditAll: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canApprove: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canDelete: ["OWNER", "ADMIN"].includes(role),
    canManageFolders: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canManageTags: ["OWNER", "ADMIN", "EDITOR"].includes(role),
    canViewAudit: ["OWNER", "ADMIN"].includes(role),
    canManageUsers: ["OWNER", "ADMIN"].includes(role),
    isOwner: role === "OWNER",
    isAdmin: ["OWNER", "ADMIN"].includes(role),
    isEditor: ["OWNER", "ADMIN", "EDITOR"].includes(role),
  };

  return permissions;
}

// UI State Types
export interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  error?: string;
  asset?: Asset;
}
