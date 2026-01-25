import { authClient } from "@/lib/auth-client"
import { toast } from "sonner";


export const handleEmailVerification = async (email: string) => {
    return await authClient.sendVerificationEmail({
        email,
        callbackURL: "/", // The redirect URL after verification
        fetchOptions: {
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
            onSuccess: async () => {
                toast.success("Verification email sent");
            },
        },
    })
}