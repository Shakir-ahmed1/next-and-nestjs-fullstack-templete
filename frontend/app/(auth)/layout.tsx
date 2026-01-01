import { requireGuest } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function GuestLayout({ children }: {children: ReactNode}) {
  const session = await requireGuest();

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
