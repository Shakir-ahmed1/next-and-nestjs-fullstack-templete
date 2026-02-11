"use client";

import { useParams } from "next/navigation";
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
import { useState } from "react";
import { toast } from "sonner";
import {
    Plus,
    Loader2,
    Shield,
    Trash2,
    Edit2,
    Check,
    ChevronUp,
    ChevronDown,
    Key,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { customStatements } from "@/lib/auth-permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";
import { Badge } from "@/components/ui/badge";

const PermissionSelectionCard = ({ resource, actions, selectedPermissions, togglePermission }: { resource: string, actions: string[], selectedPermissions: Record<string, string[]>, togglePermission: (resource: string, action: string) => void }) => {
    return (
        <Card key={resource} className="bg-muted/30 p-2 px-4 gap-2" >
            <CardHeader className="p-0 m-0">
                <CardTitle className="text-sm font-semibold capitalize">{resource}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
                {(actions as string[]).map((action) => (
                    <div
                        key={action}
                        onClick={() => togglePermission(resource, action)}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border",
                            selectedPermissions[resource]?.includes(action)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                        )}
                    >
                        {selectedPermissions[resource]?.includes(action) && <Check className="h-3 w-3" />}
                        {action}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
const ConfirmDeletionDialog = ({ openDeleteDialog, setOpenDeleteDialog, isActionPending, onDelete }:
    { openDeleteDialog: boolean, setOpenDeleteDialog: (open: boolean) => void, isActionPending: boolean, onDelete: () => void }
) => {
    return (
        <Dialog open={openDeleteDialog} onOpenChange={(open) => !open && setOpenDeleteDialog(false)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Permission</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this permission? Members assigned to this role might lose access.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpenDeleteDialog(false)}
                        disabled={isActionPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isActionPending}
                    >
                        {isActionPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
export default function OrganizationRolesPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
    const [editingRole, setEditingRole] = useState<{ id: string, name: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletionPending, setDeletionPending] = useState(false);
    const [isOpenDeleteDialog, setOpenDeleteDialog] = useState(false);

    const { data: organization } = useOrganization(slug)

    const { data: dynamicRoles, isPending, refetch } = useQuery({
        queryKey: ["organization-roles", organization?.id],
        enabled: !!organization?.id,
        queryFn: async () => {
            const res = await authClient.organization.listRoles({
                query: {
                    organizationId: organization?.id
                }
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        }
    });

    const togglePermission = (resource: string, action: string) => {
        setSelectedPermissions(prev => {
            const currentActions = prev[resource] || [];
            if (currentActions.includes(action)) {
                const updated = currentActions.filter(a => a !== action);
                if (updated.length === 0) {
                    const { [resource]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [resource]: updated };
            } else {
                return { ...prev, [resource]: [...currentActions, action] };
            }
        });
    };

    const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

    const toggleExpand = (roleId: string) => {
        setExpandedRoles((prev) => ({
            ...prev,
            [roleId]: !prev[roleId],
        }));
    };
    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName) return;

        setIsSaving(true);
        try {
            const res = await authClient.organization.createRole({
                role: roleName,
                permission: selectedPermissions,
                organizationId: organization?.id!,
            });

            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Role created successfully");
                setIsCreateDialogOpen(false);
                resetForm();
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create role");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole || !roleName) return;

        setIsSaving(true);
        try {
            const res = await authClient.organization.updateRole({
                roleId: editingRole.id,
                organizationId: organization?.id!,
                data: {
                    roleName: editingRole.name !== roleName ? roleName : undefined,
                    permission: selectedPermissions,
                }
            });

            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Role updated successfully");
                setIsUpdateDialogOpen(false);
                resetForm();
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update role");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        setDeletionPending(true);
        try {
            const res = await authClient.organization.deleteRole({
                roleId: roleId,
                organizationId: organization?.id!,
            });
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Role deleted successfully");
                refetch();
            }
            setDeletionPending(false);
            setOpenDeleteDialog(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete role");
        }
    };

    const resetForm = () => {
        setRoleName("");
        setSelectedPermissions({});
        setEditingRole(null);
    };

    const openEditDialog = (role: any) => {
        setEditingRole({ id: role.id, name: role.role });
        setRoleName(role.role);
        // Assuming role.permission is in the format expected
        setSelectedPermissions(role.permission || {});
        setIsUpdateDialogOpen(true);
    };

    if (isPending) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Custom Roles</h2>
                    <p className="text-muted-foreground">
                        Create and manage dynamic roles for your organization.
                    </p>
                </div>
                <PermissionGuard permission={{
                    ac: ["create"],
                }}>
                    <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                        setIsCreateDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <form onSubmit={handleCreateRole}>
                                <DialogHeader>
                                    <DialogTitle>Create Custom Role</DialogTitle>
                                    <DialogDescription>
                                        Define a new role and assign specific permissions.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="role-name">Role Name</Label>
                                        <Input
                                            id="role-name"
                                            placeholder="e.g. Project Manager"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Permissions</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-h-[40vh] overflow-y-auto p-1">
                                            {Object.entries(customStatements).map(([resource, actions]) => (
                                                <PermissionSelectionCard key={resource} resource={resource} actions={actions} selectedPermissions={selectedPermissions} togglePermission={togglePermission} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Role
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PermissionGuard>
            </div>

            <div className="grid gap-4">
                <div className="space-y-4">
                    {dynamicRoles?.map((role: any) => {
                        const isExpanded = !!expandedRoles[role.id];

                        return (
                            <Card key={role.id} className="transition-all duration-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            {role.role}
                                        </CardTitle>
                                        <CardDescription>
                                            Custom organization role
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PermissionGuard permission={{ ac: ["update"] }}>
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)}>
                                                <Edit2 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </PermissionGuard>

                                        <PermissionGuard permission={{ ac: ["delete"] }}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setOpenDeleteDialog(true)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                            <ConfirmDeletionDialog openDeleteDialog={isOpenDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog} isActionPending={isDeletionPending} onDelete={() => handleDeleteRole(role.id)} />
                                        </PermissionGuard>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpand(role.id)}
                                            className="mr-2"
                                        >
                                            {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                        </Button>

                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="pt-4 border-t bg-slate-50/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(role.permission || {}).map(([resource, actions]: [string, any]) => (
                                                <div key={resource} className="bg-white p-3 rounded-lg border shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Key className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-bold capitalize text-sm">{resource}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(actions as string[]).map((action) => {
                                                            return <Badge
                                                                key={action}
                                                                // variant="secondary"
                                                                className="text-[10px] px-2 tracking-wider"
                                                            >
                                                                <p className="capitalize">{action}</p>
                                                            </Badge>
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}

                    {(!dynamicRoles || dynamicRoles.length === 0) && (
                        <div className="text-center py-12 border rounded-lg bg-muted/20">
                            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No custom roles yet</h3>
                            <p className="text-muted-foreground">Create dynamic roles to customize access for your team.</p>
                        </div>
                    )}
                </div>

                <Dialog open={isUpdateDialogOpen} onOpenChange={(open) => {
                    setIsUpdateDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogContent className="max-w-2xl">
                        <form onSubmit={handleUpdateRole}>
                            <DialogHeader>
                                <DialogTitle>Update Custom Role</DialogTitle>
                                <DialogDescription>
                                    Modify the permissions for this custom role.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-role-name">Role Name</Label>
                                    <Input
                                        id="edit-role-name"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Permissions</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-h-[40vh] overflow-y-auto p-1">
                                        {Object.entries(customStatements).map(([resource, actions]) => (
                                            <PermissionSelectionCard resource={resource} actions={actions} selectedPermissions={selectedPermissions} togglePermission={togglePermission} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Role
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
