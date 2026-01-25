import { requireUnverified } from "@/lib/auth-helpers";
import { ResendButton } from "./sign-out-button";

export default async function VerifyEmail() {
    const session = await requireUnverified()
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <h1 className="text-5xl font-bold mb-4">A verification email has been sent to your email address. </h1>
            <p className="text-lg mb-6">Please check your email and click the link to verify your email address <span className="font-bold">{session.user.email}</span></p>
            <p className="text-lg mb-6">If you have not received the email, please check your spam folder.</p>
            <ResendButton email={session.user.email} />

        </div>
    );

}