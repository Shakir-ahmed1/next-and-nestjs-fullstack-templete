// lib/authHelpers.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unauthorizedError } from "./errors";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
export async function getAuthUser() {
  const session = await getServerSession();
  if (!session) {
    throw unauthorizedError()
  }
  return session.user;

}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    // redirect to login page
    throw redirect("/signin");
  }
  return session;
}

export async function requireGuest() {
  const session = await getServerSession();
  if (session) {
    // redirect to home/dashboard if already logged in
    throw redirect("/"); // or "/"
  }
  return null;
}
