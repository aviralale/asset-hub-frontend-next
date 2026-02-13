"use client";

import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4 bg-red-50">
          <div className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-700 mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
