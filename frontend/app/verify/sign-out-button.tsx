'use client'

import { Button } from "@/components/ui/button"
import { handleSignOut } from "@/lib/auth-client"
import { handleEmailVerification } from "./sendEmailVerification"

export function ResendButton({ email }: { email: string }) {
    return (
        <div className="flex gap-2">
            <Button onClick={handleSignOut} >Sign Out</Button>
            <Button onClick={() => handleEmailVerification(email)} >Re Send Verification Email</Button>
        </div>
    )
}