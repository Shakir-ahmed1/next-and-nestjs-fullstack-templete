import { NEXT_PUBLIC_APP_URL } from "@/config";
import {
    createAuthClient
} from "better-auth/react";
import { redirect } from "next/navigation";


export const authClient = createAuthClient({
    baseURL: NEXT_PUBLIC_APP_URL,
})

export const handleSignOut = async () => {
    await authClient.signOut()
    redirect('/signin')
}