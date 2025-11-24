'use client'
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";



export default function RequestPasswordReset() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);


    const handleRequestPasswordReset = async () => {
        if (!email) {
            toast("Email field is required")
        }
        const { data, error } = await authClient.requestPasswordReset({
            email: email,
            redirectTo: "/reset-password",
        });
        if (data) {
            toast(data.message)
        } else {
            toast.error(error?.message || "")
        }
    }

    return (
        <div className='flex flex-col items-center mt-4'>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Forgot Password</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Enter your email below to reset to your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                value={email}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            onClick={handleRequestPasswordReset}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <p> Send Reset Link To Email </p>
                            )}
                        </Button>

                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex justify-center w-full border-t py-4">
                        <p className="text-center text-xs">
                            <Link
                                href="/signin"
                            >
                                <span className="dark:text-white/70 cursor-pointer text-orange-400">
                                    Log in
                                </span>
                            </Link>
                            {" "}
                            instead
                        </p>
                    </div>
                </CardFooter>

            </Card>
        </div>
    )

}