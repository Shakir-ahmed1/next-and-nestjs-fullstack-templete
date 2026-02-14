"use client";
import { useEffect } from "react";


export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
      </head>
      <body>
        <div className="flex flex-col items-center justify-center h-screen text-center px-4" style={{ fontFamily: 'sans-serif' }}>
          <h1 className="text-5xl font-bold mb-4">Something went wrong</h1>
          <p className="text-lg mb-6">{error.message}</p>
          <button
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            onClick={() => reset()}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
