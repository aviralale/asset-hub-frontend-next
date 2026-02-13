"use client";

/**
 * User Context Provider
 * Manages authentication state and user permissions
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogin } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";
import { getUserPermissions } from "@/lib/permissions";
import type { User, PermissionCheck, LoginCredentials } from "@/lib/types";

interface UserContextType {
  user: User | null;
  permissions: PermissionCheck;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Get auth state from useCurrentUser
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useCurrentUser();
  const loginMutation = useLogin();

  // Track if we're still doing initial auth check
  const [isInitializing, setIsInitializing] = useState(true);

  // Calculate final auth state
  const isAuthenticated = !!user && !userError;
  const isLoading = userLoading || isInitializing;

  // After initial load, we're done initializing
  useEffect(() => {
    if (!userLoading) {
      setIsInitializing(false);
    }
  }, [userLoading]);

  // If auth failed with an error, clear tokens
  useEffect(() => {
    if (!userLoading && userError) {
      console.log("Auth error detected, clearing tokens");
      apiClient.logout();
    }
  }, [userError, userLoading]);

  const permissions = getUserPermissions(user || null);

  const login = async (credentials: LoginCredentials) => {
    const result = await loginMutation.mutateAsync(credentials);
    await refetch();
    router.push("/");
  };

  const logout = () => {
    apiClient.logout();
    router.push("/login");
  };

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        permissions,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
