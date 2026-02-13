"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import {
    UserPlus,
    Loader2,
    Shield,
    Trash2,
    Mail,
    ChevronDown,
} from "lucide-react";
import { organizationRoles } from "../../roles";
import { InvitationStatus } from "better-auth/plugins";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberPermissionGuard } from "@/components/auth/member-permission-guard";
import { useCurrentActiveOrgMember, useOrganization } from "@/hooks/use-organization";
const invitationStatusColor: Record<InvitationStatus, string> = {
    pending: "bg-secondary text-secondary-foreground ring-border",

    accepted: "bg-primary/15 text-green-600 ring-primary/30",

    rejected: "bg-destructive/15 text-destructive ring-destructive/30",

    canceled: "bg-muted text-muted-foreground ring-border",
};
function RoleSelect({
    organizationId,
    onValueChange,
    value, // Add this
}: {
    organizationId?: string,
    onValueChange: (value: string) => void,
    value: string // Add this
}) {
    const { data: dynamicRoles } = useQuery({
        queryKey: ["organization-roles", organizationId],
        enabled: !!organizationId,
        queryFn: async () => {
            const res = await authClient.organization.listRoles({
                query: {
                    organizationId: organizationId
                }
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        }
    });

    const staticRoles = Object.values(organizationRoles);
    const dynamicRolesList = dynamicRoles?.map(r => r.role) || [];
    const memberRolesList = [...staticRoles, ...dynamicRolesList];

    return (
        <Select
            value={value} // Switch from defaultValue to value
            onValueChange={onValueChange}
        >
            <SelectTrigger
                className="h-8 text-xs w-full 
                           min-w-25 max-w-27
                           md:min-w-25 md:max-w-30"
            >

                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {memberRolesList.map((role) => (
                    <SelectItem key={role} value={role} className="text-xs">
                        {role}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}


export default function OrganizationMembersPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState(organizationRoles.guest);
    const [isInviting, setIsInviting] = useState(false);
    const [showInvitationHistory, setShowInvtationHistory] = useState(false);
    const currentActiveOrgMember = useCurrentActiveOrgMember();

    const { data: organization, isPending, refetch } = useOrganization(slug)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(true);
        try {
            const res = await authClient.organization.inviteMember({
                email: inviteEmail,
                role: inviteRole as any,
                organizationId: organization?.id!,
            });

            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Invitation sent successfully");
                setIsInviteDialogOpen(false);
                setInviteEmail("");
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to send invitation");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            const res = await authClient.organization.removeMember({
                memberIdOrEmail: memberId,
                organizationId: organization?.id!,
            });
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Member removed successfully");
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to remove member");
        }
    };

    const handleCancelInvite = async (invitationId: string) => {
        try {
            const res = await authClient.organization.cancelInvitation({
                invitationId,
            });
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Invitation cancelled successfully");
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel invitation");
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string, oldRole: string) => {
        // 1. (Optional) Optimistically update UI or just let the async call run

        try {
            const res = await authClient.organization.updateMemberRole({
                memberId,
                role: newRole as any,
                organizationId: organization?.id!,
            });

            if (res.error) {
                toast.error(res.error.message);
                // The value won't change in the UI if you are controlling it 
                // and don't trigger a state update/refetch here.
            } else {
                toast.success("Role updated successfully");
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update role");
            // If you used optimistic updates, revert the state here
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Members</h2>
                    <p className="text-muted-foreground">
                        Manage members and their roles within the organization.
                    </p>
                </div>
                <MemberPermissionGuard permission={{
                    invitation: ["create"],
                }}>
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleInvite}>
                                <DialogHeader>
                                    <DialogTitle>Invite Member</DialogTitle>
                                    <DialogDescription>
                                        Send an invitation email to a new member.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="colleague@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <RoleSelect organizationId={organization?.id} onValueChange={(value) => setInviteRole(value)} value={inviteRole} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isInviting}>
                                        {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Invite
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </MemberPermissionGuard>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Members</CardTitle>
                    <CardDescription>
                        People who have access to this organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {organization?.members?.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""} />
                                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{member.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                    </div>
                                </div>
                                <MemberPermissionGuard permission={{
                                    members: ["update", "delete"],
                                }}>
                                    <div className="flex items-center gap-4">
                                        <RoleSelect
                                            key={member.id}
                                            value={member.role} // This comes from your server data
                                            onValueChange={(newValue) => handleUpdateRole(member.id, newValue, member.role)}
                                            organizationId={organization.id}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleRemoveMember(member.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </MemberPermissionGuard>
                            </div>
                        ))}
                        {(!organization?.members || organization.members.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground italic">
                                No active members found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {organization?.invitations && organization.invitations.length > 0 && (
                <MemberPermissionGuard permission={{
                    invitation: ["create", "cancel"],
                }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>
                                Invites that haven't been accepted yet.
                            </CardDescription>
                            <CardAction>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="confirm-disabled"
                                        checked={showInvitationHistory}
                                        onCheckedChange={(checked) => setShowInvtationHistory(checked === true)}
                                    />
                                    <Label
                                        htmlFor="confirm-disabled"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Show Invitation History
                                    </Label>
                                </div>                        </CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {organization.invitations.filter((invite) => showInvitationHistory ? true : invite.status === "pending").sort(
                                    (a, b) =>
                                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                )
                                    .map((invite) => (
                                        <div key={invite.id} className="flex items-center justify-between p-2 rounded-lg border border-dashed">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{invite.email}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Role: {invite.role}
                                                    </p>
                                                    <p
                                                        className="text-xs text-muted-foreground"
                                                        title={invite.createdAt.toLocaleString()}
                                                    >
                                                        Sent {invite.createdAt.toLocaleDateString(undefined, {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                </div>

                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${invitationStatusColor[invite.status]}`}>{invite.status}</span>
                                                <MemberPermissionGuard permission={{
                                                    invitation: ["cancel"],
                                                }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs font-normal"
                                                        onClick={() => handleCancelInvite(invite.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </MemberPermissionGuard>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </MemberPermissionGuard>
            )}
        </div>
    );
}


