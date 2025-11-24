// AvatarUpload.tsx
"use client";
import { ChangeEvent, FormEvent, SetStateAction, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Image from "next/image";
import { User } from "@/hooks/use-profile";
import { toast } from "sonner";

interface Props {
    user: User;
    image: string;
    setImage: (value: SetStateAction<string>) => void
}

export default function AvatarUpload({ user, image, setImage }: Props) {
    const [preview, setPreview] = useState<null | string>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const queryClient = useQueryClient();


    function triggerFilePicker() {
        document.getElementById("avatar-file-input")?.click();
    }

    function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setModalOpen(true);
        }
    }

    async function confirmUpload() {
        const fileInput = document.getElementById("avatar-file-input") as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        setUploading(true);

        try {
            const res = await api.post("/profile/avatar", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // optional, Axios can set it automatically
                },
            });


            const data = await res.data;
            if (!data) throw new Error(data.error || "Upload failed");

            setImage(data.url);
            setModalOpen(false);
            setPreview(null);
            toast.success("Avatar updated successfully!" )
            queryClient.invalidateQueries({ queryKey: ["profile"] });

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete() {
        setUploading(true);
        try {
            const res = await api.delete("/profile/avatar");
            const data = await res.data;
            if (!data) throw new Error(data.error || "Failed to delete avatar");

            setImage("");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            toast.success("Avatar removed.");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-white shadow">
                        <AvatarImage src={image || undefined} />
                        <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-lg font-medium">{user?.name}</p>
                        <p className="text-muted-foreground text-sm">{user?.email}</p>
                    </div>
                </div>

                <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="flex gap-3">
                    <Button onClick={triggerFilePicker} className="flex items-center gap-2">
                        Upload
                    </Button>

                    <Button variant="destructive" onClick={handleDelete} disabled={uploading}>
                        Delete
                    </Button>
                </div>

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-center">Preview Avatar</DialogTitle>
                        </DialogHeader>

                        {/* Centered Image Container */}
                        <div className="flex justify-center py-6">
                            <div className="relative w-64 h-64 max-w-full">
                                {/* 
          - w-64 h-64 → fixed preview size on desktop
          - max-w-full → shrinks on very small screens so it never overflows
          - objectFit: "contain" → preserves aspect ratio + letterboxing
        */}
                                {preview && (
                                    <Image
                                        src={preview}
                                        alt="Avatar preview"
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 640px) 80vw, 256px"
                                        priority
                                    />
                                )}
                            </div>
                        </div>

                        {/* Centered Button */}
                        <DialogFooter className="flex justify-center sm:justify-center">
                            <Button
                                onClick={confirmUpload}
                                disabled={uploading}
                                className="flex items-center gap-2 min-w-[140px]"
                            >
                                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Set as Avatar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

// ProfilePage.tsx
