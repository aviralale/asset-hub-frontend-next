"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors
      theme="light"
      toastOptions={{
        style: {
          background: "#fff",
          color: "#0a0a0a",
          border: "1px solid #e5e5e5",
        },
      }}
    />
  );
}
