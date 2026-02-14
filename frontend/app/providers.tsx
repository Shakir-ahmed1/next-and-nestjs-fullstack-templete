"use client";

import DevHealthWidget from "@/components/dev-health-widget";
import { NEXT_PUBLIC_NODE_ENV } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";


import { ThemeProvider } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import ActiveOrganizationContext from "@/hooks/contexts/active-organization";


function InnerProviders({ children }: { children: React.ReactNode }) {
  const { data: activeOrg, refetch } = authClient.useActiveOrganization();
  const handleSetActiveOrg = async (orgSlug: string) => {
    await authClient.organization.setActive({
      organizationSlug: orgSlug,
    });
    await refetch();
    redirect(`/organizations/${orgSlug}`);
  };

  return (
    <ActiveOrganizationContext.Provider value={{ handleSetActiveOrg, activeOrg }}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

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
        <InnerProviders>
          {children}
        </InnerProviders>
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

