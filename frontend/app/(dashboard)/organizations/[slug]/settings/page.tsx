"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Loader2,
    Trash2,
    Save,
    AlertTriangle,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useOrganization } from "@/hooks/use-organization";

export default function OrganizationSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [name, setName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");

    const { data: organization, isPending, refetch } = useOrganization(slug);

    useEffect(() => {
        if (organization) {
            setName(organization.name);
            setNewSlug(organization.slug);
        }
    }, [organization]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await authClient.organization.update({
                organizationId: organization?.id!,
                data: {
                    name,
                    slug: newSlug,
                }
            });

            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Organization updated successfully");
                if (newSlug !== slug) {
                    router.push(`/organizations/${newSlug}/settings`);
                } else {
                    refetch();
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update organization");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirm !== organization?.name) {
            toast.error("Please type the organization name correctly to delete");
            return;
        }

        setIsDeleting(true);
        try {
            const res = await authClient.organization.delete({
                organizationId: organization?.id!,
            });
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Organization deleted successfully");
                router.push("/organizations");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete organization");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <PermissionGuard permission={{
                organization: ["update"],
            }}>
                <Card>
                    <form onSubmit={handleUpdate}>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Update your organization's display name and unique slug.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Organization Slug</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">/</span>
                                    <Input
                                        id="slug"
                                        value={newSlug}
                                        onChange={(e) => setNewSlug(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Slugs can only contain lowercase letters, numbers, and hyphens.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </PermissionGuard>
            <PermissionGuard permission={{
                organization: ["delete"],
            }}>

                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions that affect your organization and its data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm font-medium">Delete this organization</p>
                        <p className="text-sm text-muted-foreground">
                            Once you delete an organization, there is no going back. Please be certain.
                            Type <span className="font-bold text-foreground">{organization?.name}</span> to confirm.
                        </p>
                        <Input
                            placeholder="Type organization name..."
                            className="border-red-200 focus-visible:ring-red-500"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="border-t bg-red-50/50 px-6 py-4">
                        <Button
                            variant="destructive"
                            disabled={isDeleting || deleteConfirm !== organization?.name}
                            onClick={handleDelete}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Organization
                        </Button>
                    </CardFooter>
                </Card>
            </PermissionGuard>
        </div>
    );
}
