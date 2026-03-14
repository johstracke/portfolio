'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-ink/80 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-2 border-[3px] border-black bg-primary text-ink font-bold shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
      >
        Try again
      </button>
    </div>
  );
}
