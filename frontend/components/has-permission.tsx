"use client";

import { authClient } from "@/lib/auth-client";
import { Fragment, ReactNode, useEffect, useState } from "react";

type HasPermissionProps = {
  children: ReactNode;
  permissions?: any;
  item: string;
};

export default function HasPermission({
  children,
  permissions,
  item,
}: HasPermissionProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  if (!permissions) return <Fragment>{children}</Fragment>;
  console.log("permissions111", permissions);

  useEffect(() => {
    let mounted = true;
        async function checkPermission() {
      const result = await authClient.organization.hasPermission({
        permissions,
      });
      console.log("result:", item, result);
      if (!mounted) return;

      setAllowed(!result.error);
    }

    checkPermission();

    return () => {
      mounted = false;
    };
  }, [permissions]);

  // Optional: loading state
  if (allowed === null) return null;

  if (!allowed) return null;

  return <Fragment>{children}</Fragment>;
}
