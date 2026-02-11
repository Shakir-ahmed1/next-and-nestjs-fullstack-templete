import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from "./ui/dialog";
import { PermissionGuard } from "./auth/permission-guard";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
// INCOMPLETE
interface Props {
    children: React.ReactNode;
    details: {
        title: string;
        description: string;
        permission: {
            ac: string[];
        }
    }
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (open: boolean) => void;
    resetForm: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isSaving: boolean;
    roleName: string;
    setRoleName: (name: string) => void;
    selectedPermissions: Record<string, string[]>;
    togglePermission: (resource: string, action: string) => void;
    customStatements: Record<string, string[]>;

}
export const RoleActionsDialog = ({
    children,
    details,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    resetForm,
    onSubmit,
    isSaving,
    roleName,
    setRoleName,
    selectedPermissions,
    togglePermission,
    customStatements,
}: Props) => {
    
    return (
        <PermissionGuard permission={details.permission}>
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
                    <form onSubmit={onSubmit}>
                        <DialogHeader>
                            <DialogTitle>{details.title}</DialogTitle>
                            <DialogDescription>
                                {details.description}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto p-1">
                                    {Object.entries(customStatements).map(([resource, actions]) => (
                                        <Card key={resource} className="bg-muted/30 gap-1">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-semibold capitalize">{resource}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="py-0 flex flex-wrap gap-2">
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

    )
}