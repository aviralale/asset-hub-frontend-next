"use client";

import React, { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationNavProps {
  total: number;
  initialPage?: number;
  onChange?: (page: number) => void;
}

export function PaginationNav({
  total,
  initialPage = 1,
  onChange,
}: PaginationNavProps) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onChange?.(newPage);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (page >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) handlePageChange(page - 1);
            }}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={page === p}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(p as number);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < total) handlePageChange(page + 1);
            }}
            className={page === total ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
