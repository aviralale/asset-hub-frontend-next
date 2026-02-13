// ==================== User and Auth Types ====================

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

export interface TokenResponse {
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
  re_password: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
}

// ==================== Permission Types ====================

export interface PermissionCheck {
  canView: boolean;
  canUpload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageFolders: boolean;
  canManageTags: boolean;
  canViewAudit: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

// ==================== Asset Types ====================

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
  created_by: number;
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

// ==================== Audit Types ====================

export interface AuditLog {
  id: string;
  actor: string | null;
  actor_username: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

// ==================== API Response Types ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: string;
  detail: string | string[] | Record<string, string[]>;
  status_code: number;
}

// ==================== Upload Types ====================

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

// ==================== Filter and Query Types ====================

export interface AssetFilters {
  page?: number;
  page_size?: number;
  search?: string;
  tag?: string;
  folder?: string;
  type?: string;
  status?: AssetStatus;
  deleted?: boolean;
}

export interface FolderFilters {
  page?: number;
}

export interface TagFilters {
  page?: number;
}

export interface AuditFilters {
  page?: number;
  action?: string;
  target_type?: string;
  actor?: string;
}
