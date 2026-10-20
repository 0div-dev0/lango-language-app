"use client";

/* Global provider stack: ErrorBoundary → Toaster, wrapping every route. */
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Toaster theme="dark" />
      {children}
    </ErrorBoundary>
  );
}
