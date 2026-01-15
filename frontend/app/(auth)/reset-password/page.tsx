'use client'
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";



export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const handlePasswordReset = async () => {
        const token = searchParams.get("token");
        if (confirmPassword !== password) {
            toast.error("Password and Confirm password must be the same")
            return
        }
        if (!token) {
            toast.error("Please use the link sent to your email");
            return;
        }

        const { data, error } = await authClient.resetPassword(
            {
                newPassword: password,
                token,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onResponse: () => {
                    setLoading(false);
                    toast("Password reset successfully");
                },
            }
        );
        if (error) {
            toast.error("Please use the link sent to your email");
        } else {
            toast("Password changed succesfully")
            router.push('/')
        }
    };

    if (!searchParams.get("token")) {
        return (<div className="flex flex-col items-center mt-4">
            <h1>Invalid reset link               <Link
                href="/signin"
            >
                <span className="dark:text-white/70 cursor-pointer text-orange-400">
                    Sign in
                </span>
            </Link></h1>
        </div>)
    }

    return (
        <div className='flex flex-col items-center mt-4'>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Forgot Password</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter the new password"
                                required
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                value={password}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm the new password"
                                required
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                }}
                                value={confirmPassword}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            onClick={handlePasswordReset}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <p>Change password</p>
                            )}
                        </Button>

                    </div>
                </CardContent>
            </Card>
        </div>
    )

}