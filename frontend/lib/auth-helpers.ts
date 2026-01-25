// Auth helpers for server components - fetches session from backend API
import { NEXT_PUBLIC_NGINX_HOST_NAME, NEXT_PUBLIC_NGINX_PORT } from "@/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** SHARED */
export const COOKIE_PREFIX = "twin-commerce";
export const COOKIE_SESSION_TOKEN = `${COOKIE_PREFIX}.session_token`;/**
 * Get session from backend API
 * This is used in server components to check authentication status
 */
export async function getSession() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get(COOKIE_SESSION_TOKEN);

        if (!sessionToken) {
            return null;
        }

        // Call backend to validate session
        const response = await fetch(`http://${NEXT_PUBLIC_NGINX_HOST_NAME}:${NEXT_PUBLIC_NGINX_PORT}/api/auth/get-session`, {
            headers: {
                Cookie: `${COOKIE_SESSION_TOKEN}=${sessionToken.value}`,
            },
            cache: 'no-store',
        });
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data || null;
    } catch (error) {
        console.error("Error fetching session:", error);
        return null;
    }
}

/**
 * Require authentication - redirects to /signin if not authenticated
 */
export async function requireAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/signin");
    }

    return session;
}

/**
 * Require guest (not authenticated) - redirects to / if authenticated
 */
export async function requireGuest() {
    const session = await getSession();
    return session;
}

/**
 * Get authenticated user or null
 */
export async function getAuthUser() {
    const session = await getSession();
    return session?.user || null;
}
