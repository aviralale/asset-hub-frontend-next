"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { NavigationDock } from "@/components/NavigationDock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  Activity,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Image,
  Folder,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuditPage() {
  const router = useRouter();
  const { user, permissions } = useUser();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("all");

  const { data: auditData, isLoading } = useQuery({
    queryKey: ["audit", page, action],
    queryFn: () =>
      apiClient.getAuditLogs({
        page,
        page_size: 20,
        action: action === "all" ? undefined : action,
      }),
    enabled: permissions.canViewAudit,
  });

  if (!permissions.canViewAudit) {
    return (
      <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
        <NavigationDock user={user} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Lock className="w-16 h-16 text-gray-300" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              Access Denied
            </p>
            <p className="text-gray-600 max-w-md">
              You don't have permission to view audit logs.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="w-5 h-5" />;
      case "updated":
        return <Edit3 className="w-5 h-5" />;
      case "deleted":
        return <Trash2 className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-50 text-green-700 border-green-200";
      case "updated":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "deleted":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getActionIconBackground = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-600";
      case "updated":
        return "bg-blue-100 text-blue-600";
      case "deleted":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType?.toLowerCase()) {
      case "asset":
        return <Image className="w-5 h-5 text-blue-600" />;
      case "folder":
        return <Folder className="w-5 h-5 text-purple-600" />;
      case "tag":
        return <Tag className="w-5 h-5 text-pink-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <NavigationDock user={user} />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-400 mx-auto px-6 md:px-12">
          {/* macOS-style Header */}
          <div className="py-8 mb-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-8">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-5 w-5 object-contain cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => router.push("/")}
              />
              <ChevronRightIcon className="w-4 h-4 text-gray-300" />
              <span className="text-gray-900 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                Activity
              </span>
            </div>

            {/* Title and Description */}
            <div className="mb-8">
              <h1 className="text-4xl font-semibold text-gray-900 mb-2 tracking-tight">
                Activity Log
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
                Monitor all activities and changes across your asset hub. Track
                who created, modified, or deleted assets, folders, and tags.
              </p>
            </div>

            {/* Filter */}
            <div className="flex gap-4 items-end">
              <div className="w-full md:w-56">
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  Filter by Action
                </label>
                <Select
                  value={action}
                  onValueChange={(val) => {
                    setAction(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-600 focus:ring-blue-600 bg-white">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : auditData?.results && auditData.results.length > 0 ? (
            <>
              {/* Log Entries */}
              <div className="space-y-3">
                {auditData.results.map((log) => {
                  const changes =
                    (log as { changes?: Record<string, unknown> }).changes ||
                    log.metadata ||
                    {};
                  const actorName = log.actor_username || log.actor || "System";
                  const hasChanges = Object.keys(changes).length > 0;

                  return (
                    <div
                      key={log.id}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                    >
                      {/* Main Row */}
                      <div className="flex items-center gap-4 p-5">
                        {/* Action Icon */}
                        <div
                          className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${getActionIconBackground(log.action)} shadow-sm`}
                        >
                          {getActionIcon(log.action)}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 grid grid-cols-3 gap-8 items-start">
                          {/* Action & Time */}
                          <div>
                            <span
                              className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border mb-2 ${getActionBadgeColor(log.action)}`}
                            >
                              {log.action.charAt(0).toUpperCase() +
                                log.action.slice(1)}
                            </span>
                            <p className="text-xs text-gray-500 font-medium">
                              {formatRelativeTime(log.created_at)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(log.created_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>

                          {/* Actor */}
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                              By
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {actorName}
                            </p>
                          </div>

                          {/* Target */}
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                              Target
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-5 h-5">
                                {getTargetIcon(log.target_type)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {log.target_type}
                                </p>
                                <code className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600 font-mono border border-gray-200 block truncate">
                                  {log.target_id}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expand Indicator */}
                        {hasChanges && (
                          <div className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Changes Section */}
                      {hasChanges && (
                        <details className="group/details cursor-pointer border-t border-gray-100">
                          <summary className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors select-none">
                            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              {Object.keys(changes).length} field
                              {Object.keys(changes).length !== 1
                                ? "s"
                                : ""}{" "}
                              changed
                            </span>
                          </summary>
                          <div className="px-5 pb-4 pt-2 bg-gray-50">
                            <pre className="p-3.5 bg-gray-900 text-gray-100 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
                              {JSON.stringify(changes, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {auditData.count > 20 && (
                <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="rounded-full px-4 gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <span className="text-sm font-semibold text-gray-900">
                    {page} / {Math.ceil(auditData.count / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(auditData.count / 20)}
                    onClick={() => setPage(page + 1)}
                    className="rounded-full px-4 gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-32 h-32 rounded-3xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-8 shadow-inner">
                <Activity className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                No activity found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
                There are no audit entries matching your current filters. Try
                adjusting your selection.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
