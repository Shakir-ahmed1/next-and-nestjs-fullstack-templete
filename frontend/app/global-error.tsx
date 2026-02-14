"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";


export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Something went wrong</h1>
          <p className="text-lg mb-6">{error.message}</p>
          <Button
            onClick={() => reset()}
          >
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
