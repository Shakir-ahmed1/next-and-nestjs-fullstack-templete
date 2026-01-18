import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-helpers";
import NavSideContainer from "@/components/nav-side-container";

export default async function Home() {
  const session = await requireAuth()

return (
    <NavSideContainer>
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-4xl font-bold">Twin Commerce</h1>
        <div className="mt-8 text-center">
          <p className="text-lg mb-4">User Name: {session?.user.name}</p>
          <p className="text-lg mb-4">User ID: {session?.user.id}</p>
        </div>
      </div>
    </NavSideContainer>
  );
}