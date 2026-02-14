'use client'
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";


export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    const handlePasswordReset = async () => {
        if (confirmNewPassword !== newPassword) {
            toast.error("Password and Confirm password must be the same")
            return
        }
        if (oldPassword === newPassword) {
            toast.error("Please use a new password")
            return
        }

        const { data, error } = await authClient.changePassword({
            newPassword: newPassword, // required
            currentPassword: oldPassword, // required
            revokeOtherSessions: true,
        }, {
            onRequest: () => {
                setLoading(true);
            },
            onResponse: () => {
                setLoading(false);
                toast("Password reset successfully");
            },
            onSuccess: () => {
                toast("Password reset successfully");
            },
            onError: () => {
                toast.error("Failed to change the password, please try again");
            },
        }
        );


        if (error) {
            toast.error("Failed to change the password, please try again");
        } else {
            toast("Password changed successfully")
            router.push('/')
        }
    };

    return (
        <div className='flex flex-col items-center mt-4'>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Change Password</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">Old password</Label>
                            <Input
                                id="oldPassword"
                                type="password"
                                placeholder="Enter the old password"
                                required
                                onChange={(e) => {
                                    setOldPassword(e.target.value);
                                }}
                                value={oldPassword}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter the new password"
                                required
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                }}
                                value={newPassword}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmNewPassword">Confirm password</Label>
                            <Input
                                id="confirmNewPassword"
                                type="password"
                                placeholder="Confirm the new password"
                                required
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                }}
                                value={confirmNewPassword}
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