/**
 * LoadingSpinner - Reusable loading indicator
 * Centered spinner with message
 */
export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">{message}</p>
      </div>
    </div>
  );
}
