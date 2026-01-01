// Auth helpers for server components - fetches session from backend API
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get session from backend API
 * This is used in server components to check authentication status
 */
export async function getSession() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("better-auth.session_token");

        if (!sessionToken) {
            return null;
        }

        // Call backend to validate session
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/get-session`, {
            headers: {
                Cookie: `better-auth.session_token=${sessionToken.value}`,
            },
            cache: 'no-store',
        });
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        console.log(data)
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
