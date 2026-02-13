import { create } from 'zustand';
import type { User, RBACPermissions, Asset, Folder, Tag, UploadProgress } from '@/types';
import { getUserPermissions } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  permissions: RBACPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({
    user,
    permissions: user ? getUserPermissions(user.role) : null,
    isAuthenticated: !!user,
    isLoading: false,
  }),

  logout: () => {
    apiClient.logout();
    set({
      user: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initAuth: async () => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        
        if (storedUser && accessToken) {
          const user = JSON.parse(storedUser);
          // Verify token is still valid
          try {
            const currentUser = await apiClient.getCurrentUser();
            set({
              user: currentUser,
              permissions: getUserPermissions(currentUser.role),
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, permissions: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ user: null, permissions: null, isAuthenticated: false, isLoading: false });
        }
      }
    } catch (error) {
      set({ user: null, permissions: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

interface AssetState {
  assets: Asset[];
  selectedAssets: Set<string>;
  currentFolder: Folder | null;
  filters: {
    search: string;
    status: string;
    type: string;
    tag: string;
  };
  setAssets: (assets: Asset[]) => void;
  toggleAssetSelection: (id: string) => void;
  selectAllAssets: () => void;
  clearSelection: () => void;
  setCurrentFolder: (folder: Folder | null) => void;
  setFilters: (filters: Partial<AssetState['filters']>) => void;
  clearFilters: () => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  selectedAssets: new Set(),
  currentFolder: null,
  filters: {
    search: '',
    status: '',
    type: '',
    tag: '',
  },

  setAssets: (assets) => set({ assets }),

  toggleAssetSelection: (id) => set((state) => {
    const newSelection = new Set(state.selectedAssets);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    return { selectedAssets: newSelection };
  }),

  selectAllAssets: () => set((state) => ({
    selectedAssets: new Set(state.assets.map(a => a.id)),
  })),

  clearSelection: () => set({ selectedAssets: new Set() }),

  setCurrentFolder: (folder) => set({ currentFolder: folder }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearFilters: () => set({
    filters: { search: '', status: '', type: '', tag: '' },
  }),
}));

interface UploadState {
  uploads: UploadProgress[];
  addUpload: (upload: UploadProgress) => void;
  updateUpload: (id: string, updates: Partial<UploadProgress>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: [],

  addUpload: (upload) => set((state) => ({
    uploads: [...state.uploads, upload],
  })),

  updateUpload: (id, updates) => set((state) => ({
    uploads: state.uploads.map(u => u.id === id ? { ...u, ...updates } : u),
  })),

  removeUpload: (id) => set((state) => ({
    uploads: state.uploads.filter(u => u.id !== id),
  })),

  clearCompleted: () => set((state) => ({
    uploads: state.uploads.filter(u => u.status !== 'complete'),
  })),
}));

interface UIState {
  sidebarOpen: boolean;
  viewMode: 'grid' | 'list';
  assetDetailId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setAssetDetailId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  viewMode: 'grid',
  assetDetailId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAssetDetailId: (id) => set({ assetDetailId: id }),
}));

interface DataState {
  folders: Folder[];
  tags: Tag[];
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, folder: Folder) => void;
  removeFolder: (id: string) => void;
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, tag: Tag) => void;
  removeTag: (id: string) => void;
}

export const useDataStore = create<DataState>((set) => ({
  folders: [],
  tags: [],

  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  updateFolder: (id, folder) => set((state) => ({
    folders: state.folders.map(f => f.id === id ? folder : f),
  })),
  removeFolder: (id) => set((state) => ({
    folders: state.folders.filter(f => f.id !== id),
  })),

  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (id, tag) => set((state) => ({
    tags: state.tags.map(t => t.id === id ? tag : t),
  })),
  removeTag: (id) => set((state) => ({
    tags: state.tags.filter(t => t.id !== id),
  })),
}));
