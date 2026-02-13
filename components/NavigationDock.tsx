"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearTokens } from "@/lib/auth";
import { User } from "@/lib/types";
import { Dock, DockIcon } from "@/components/ui/dock";
import { useUploadModal } from "@/contexts/UploadContext";
import {
  IconHome,
  IconPhoto,
  IconFolders,
  IconTags,
  IconChartBar,
  IconUpload,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavigationDockProps {
  user?: User | null;
  onUploadClick?: () => void;
}

export function NavigationDock({
  user,
  onUploadClick: externalOnUploadClick,
}: NavigationDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { open: openUploadModal } = useUploadModal();

  const handleUploadClick = () => {
    // Use internal context hook if available, otherwise fall back to prop
    if (externalOnUploadClick) {
      externalOnUploadClick();
    } else {
      openUploadModal();
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/", icon: IconHome },
    { label: "Assets", href: "/assets", icon: IconPhoto },
    { label: "Folders", href: "/folders", icon: IconFolders },
    { label: "Tags", href: "/tags", icon: IconTags },
    { label: "Audit", href: "/audit", icon: IconChartBar },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <Dock
        iconSize={40}
        iconMagnification={40}
        iconDistance={100}
        className="bg-white backdrop-blur-xl border border-gray-200 shadow-lg"
      >
        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <DockIcon
              key={item.href}
              className={cn(
                "group hover:bg-gray-100 transition-all",
                active && "bg-black",
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon
                className={cn(
                  "w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors",
                  active && "text-white",
                )}
                stroke={1.5}
              />
            </DockIcon>
          );
        })}

        {/* Divider */}
        <div className="h-10 w-px bg-gray-200 mx-1" />

        {/* Upload Button */}
        {user && (
          <DockIcon
            className="group hover:bg-gray-100 transition-all"
            onClick={handleUploadClick}
          >
            <IconUpload
              className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
              stroke={1.5}
            />
          </DockIcon>
        )}

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <DockIcon className="group hover:bg-gray-100 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </DockIcon>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-56 mb-2 bg-white border-gray-200"
            >
              <DropdownMenuItem
                disabled
                className="flex flex-col items-start py-2"
              >
                <p className="font-semibold text-gray-900">
                  {user.first_name || user.username}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="py-1">
                <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                  {user.role}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <IconLogout className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Dock>
    </div>
  );
}
