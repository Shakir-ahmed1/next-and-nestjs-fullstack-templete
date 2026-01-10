import { PUBLIC_API_URL } from "@/config";
import {
    createAuthClient
} from "better-auth/react";
import { redirect } from "next/navigation";


export const authClient = createAuthClient({
    baseURL: PUBLIC_API_URL + '/auth', // Points to NestJS backend
})

export const handleSignOut = async () => {
    await authClient.signOut()
    redirect('/signin')
}