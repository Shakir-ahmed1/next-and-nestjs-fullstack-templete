"use client";
import { useState, useEffect, FormEvent } from "react";
import AvatarUpload from "./avatar-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useUserProfile();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const updateProfile = useUpdateProfile();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateProfile.mutate(
      { name: name.trim(), image: image.trim() || null },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!")
        },
        onError: (err) => {
          toast.error("Failed to save");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-700">Failed to load profile</p>
        <Button className="mt-4" onClick={() => queryClient.refetchQueries({ queryKey: ["profile"] })}>Retry</Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      <AvatarUpload user={user} image={image} setImage={setImage} />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user.email} disabled className="bg-muted cursor-not-allowed" />
            </div>

            <Button type="submit" disabled={updateProfile.isPending} className="flex items-center gap-2">
              {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
