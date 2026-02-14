"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        console.error("Segment error caught:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Something went wrong in this section</h2>
            <p className="text-lg mb-6">{error.message}</p>
            <Button
                onClick={() => reset()}
            >
                Try Again
            </Button>
        </div>
    );
}
