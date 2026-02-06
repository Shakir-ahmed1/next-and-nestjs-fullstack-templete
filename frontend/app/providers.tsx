"use client";

import DevHealthWidget from "@/components/dev-health-widget";
import { NEXT_PUBLIC_NODE_ENV } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";


import { ThemeProvider } from "@/components/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        {children}
        {NEXT_PUBLIC_NODE_ENV === 'development' &&
          <>
            <ReactQueryDevtools initialIsOpen={false} />
            <DevHealthWidget
              defaultPosition="bottom-right"
            />
          </>
        }
      </ThemeProvider>
    </QueryClientProvider>
  );
}

