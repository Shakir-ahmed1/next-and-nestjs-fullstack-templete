import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await requireAuth()

  // If auth succeeded, do NOT render "/"
  if (session?.user?.id) {
    redirect("/organizations")
  }

}