import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SecurityDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Security Dashboard Error
            </h2>
            <p className="text-gray-600 mb-6">
              The dashboard encountered a critical error and cannot be displayed.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
