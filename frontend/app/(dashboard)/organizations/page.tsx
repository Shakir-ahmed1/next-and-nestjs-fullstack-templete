"use client";

import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { useContext, useState } from "react";
import { toast } from "sonner";
import {
    Building2,
    Plus,
    Users,
    Loader2,
    ArrowRight,

} from "lucide-react";
import Link from "next/link";
import ActiveOrganizationContext from "@/hooks/contexts/active-organization";
import { useUserMemberships } from "@/hooks/use-memberships";
import { ListInvitations } from "@/components/list-invitations";
import { UserPermissionGuard } from "@/components/auth/user-permission-guard";

export default function UserOrganizationsPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgSlug, setNewOrgSlug] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [slugAlreadyExist, setSlugAlreadyExist] = useState(false);
    const { handleSetActiveOrg } = useContext(ActiveOrganizationContext)
    const session = authClient.useSession();
    const currentUser = session.data?.user ?? null;

    const { data: memberships, isPending, error, refetch: refetchMemberships } = useUserMemberships()


    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName || !newOrgSlug) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsCreating(true);
        try {
            const res = await authClient.organization.create({
                name: newOrgName,
                slug: newOrgSlug,
                keepCurrentActiveOrganization: false,
            });
            console.log(res)
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Organization created successfully");
                setIsCreateDialogOpen(false);
                setNewOrgName("");
                setNewOrgSlug("");
                refetchMemberships();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create organization");
        } finally {
            setIsCreating(false);
        }
    };

    const handleSlugChecking = async (slug: string) => {
        const checkSlug = await authClient.organization.checkSlug({
            slug,
        });
        if (checkSlug.error) {
            setSlugAlreadyExist(true);
        } else {
            setSlugAlreadyExist(false);
        }
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading organizations: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                        Manage your organizations and memberships.
                    </p>
                </div>

                <UserPermissionGuard permissions={{
                    organization: ['create']
                }}>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Organization
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCreateOrganization}>
                                <DialogHeader>
                                    <DialogTitle>Create Organization</DialogTitle>
                                    <DialogDescription>
                                        Create a new organization to manage your team and projects.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Organization Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Acme Inc."
                                            value={newOrgName}
                                            onChange={(e) => {
                                                setNewOrgName(e.target.value);
                                                // Simple slug generation
                                                if (!newOrgSlug || newOrgSlug === newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
                                                    const generatedSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                                    handleSlugChecking(generatedSlug);
                                                    setNewOrgSlug(generatedSlug);
                                                }

                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            placeholder="acme-inc"
                                            value={newOrgSlug}
                                            onChange={async (e) => {
                                                handleSlugChecking(e.target.value);
                                                setNewOrgSlug(e.target.value)
                                            }}
                                            required
                                        />
                                        {slugAlreadyExist && (
                                            <p className="text-xs text-red-500">
                                                Slug already exists
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            This will be used in your organization's URL.
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isCreating || slugAlreadyExist}>
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </UserPermissionGuard>
            </div>

            <ListInvitations onAcceptInvitation={() => refetchMemberships()} />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    My Organizations
                </h2>
                {isPending ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-24 bg-muted/50" />
                                <CardContent className="h-16" />
                            </Card>
                        ))}
                    </div>
                ) : memberships?.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Building2 className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="mt-6 text-xl font-semibold">No organizations joined</h2>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            You are not a member of any organization. Create one or wait for an invitation.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {memberships?.map(({ role, organization: org }) => (
                            <Card key={org.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 rounded-lg">
                                            <AvatarImage src={org.logo || ""} />
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                                {org.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <CardTitle className="text-lg line-clamp-1">{org.name}</CardTitle>
                                            <CardDescription className="text-xs">/{org.slug}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span className="capitalize">{role}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline" size="sm" className="flex-1" onClick={() => handleSetActiveOrg(org.slug)}>
                                                <Link href={`/organizations/${org.slug}`}>
                                                    <ArrowRight className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
                }
            </div >
        </div >
    );
}



