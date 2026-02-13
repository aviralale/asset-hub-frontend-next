"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { UploadModal } from "@/components/UploadModal";

interface UploadContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <UploadContext.Provider value={{ isOpen, open, close }}>
      {children}
      <UploadModal
        isOpen={isOpen}
        onClose={close}
        onSuccess={() => {
          // Optionally handle success
        }}
      />
    </UploadContext.Provider>
  );
}

export function useUploadModal() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUploadModal must be used within UploadProvider");
  }
  return context;
}
