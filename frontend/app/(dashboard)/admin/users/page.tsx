"use client";

import { authClient } from "@/lib/auth-client";
import {
    Card,
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
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
    Shield,
    ShieldAlert,
    UserX,
    UserCheck,
    Loader2,
    Trash2,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    KeyRound,
    Key
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { rolePower } from "@/components/auth/user-permission-guard";
import { UserRole, UserRoles } from "@/lib/admin-helpers";

export default function AdminUsersPage() {
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [confirmDisabled, setConfirmDisabled] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<{
        type: "ban" | "unban" | "delete" | "role";
        userId: string;
        userName: string;
        data?: any;
    } | null>(null);
    const [isActionPending, setIsActionPending] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const session = authClient.useSession();
    const currentUser = session.data?.user;
    const currentUserRole = currentUser?.role as UserRole || UserRoles.admin;
    const currentPower = rolePower[currentUserRole] ?? 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setOffset(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: usersData, isPending, isFetching, error, refetch } = useQuery({
        queryKey: ["admin-users", limit, offset, debouncedSearch, sortBy, sortDirection],
        queryFn: async () => {
            const res = await authClient.admin.listUsers({
                query: {
                    limit,
                    offset,
                    searchField: "name",
                    searchValue: debouncedSearch,
                    sortBy,
                    sortDirection,
                }
            });
            if (res.error) throw new Error(res.error.message);
            return res.data
        },
        placeholderData: (previousData) => previousData,
    });

    // Pre-computing user filtering and permissions
    const { processedUsers, currentVisibleCount, totalHiddenInBatch } = useMemo(() => {
        if (!usersData?.users || !currentUser) {
            return { processedUsers: [], currentVisibleCount: 0, totalHiddenInBatch: 0 };
        }
        // filter out users that the current user cannot see
        const filtered = usersData.users.filter((user) => {
            if (user.id === currentUser.id) return true;
            const targetRole = user.role as UserRole || UserRoles.admin;
            const targetPower = rolePower[targetRole] ?? 0;

            // Visibility Logic:
            // user, admin (0, 1) -> seen by admin+ (power >= 1)
            // owner, super_owner (2, 3) -> seen by super_owner (power >= 3)
            if (targetPower <= 1) return currentPower >= 1;
            if (targetPower >= 2) return currentPower >= 3;
            return false;
        });

        const mapped = filtered.map((user) => {
            const targetRole = user.role as UserRole || UserRoles.admin;
            const roleValue = rolePower[targetRole] ?? 0;

            // Action Logic:
            // super_owner can be acted on by none
            const isSuperOwner = user.role === UserRoles.super_owner;
            // target can be acted on by someone with strictly higher power
            const canManage = !isSuperOwner && currentPower >= roleValue + 1;

            return {
                ...user,
                permissions: {
                    canBan: canManage,
                    canDelete: canManage,
                    canChangeGeneralRole: canManage,
                    canPromoteToOwner: currentUserRole === UserRoles.super_owner && (user.role === UserRoles.owner || user.role === UserRoles.admin),
                    canPromoteToAdmin: canManage && user.role !== UserRoles.admin,
                }
            };
        });

        return {
            processedUsers: mapped,
            currentVisibleCount: filtered.length,
            totalHiddenInBatch: usersData.users.length - filtered.length
        };
    }, [usersData?.users, currentUser, currentPower, currentUserRole]);

    const users = processedUsers;

    const totalUsers = usersData?.total || 0;
    // Adjusted total to fix the conflict on displayed user count
    const adjustedTotalUsers = Math.max(0, totalUsers - totalHiddenInBatch);

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(adjustedTotalUsers / limit);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingUser(true);
        try {
            const res = await authClient.admin.createUser({
                email: newUserEmail,
                password: newUserPassword,
                name: `${newFirstName} ${newLastName}`,
            });

            if (res.error) {
                toast.error(res.error.message || "Failed to create user");
            } else {
                toast.success("User created successfully");
                setIsCreateDialogOpen(false);
                setNewFirstName("");
                setNewLastName("");
                setNewUserEmail("");
                setNewUserPassword("");
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleBanUser = async (userId: string, isBanned: boolean, skipConfirm = false) => {
        if (!confirmDisabled && !skipConfirm) {
            const user = users.find(u => u.id === userId);
            setActionToConfirm({
                type: isBanned ? "unban" : "ban",
                userId,
                userName: user?.name || UserRoles.admin,
            });
            return;
        }

        setIsActionPending(true);
        try {
            if (isBanned) {
                const res = await authClient.admin.unbanUser({ userId });
                if (res.data) {
                    toast.success("User unbanned successfully");
                } else {
                    toast.error("Failed to unban user");
                }
            } else {
                const res = await authClient.admin.banUser({ userId });
                if (res.data) {
                    toast.success("User banned successfully");
                } else {
                    toast.error("Failed to ban user");
                }
            }
            refetch();
            setActionToConfirm(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to update user status");
        } finally {
            setIsActionPending(false);
        }
    };

    const handleDeleteUser = async (userId: string, skipConfirm = false) => {
        if (!confirmDisabled && !skipConfirm) {
            const user = users.find(u => u.id === userId);
            setActionToConfirm({
                type: "delete",
                userId,
                userName: user?.name || UserRoles.admin,
            });
            return;
        }

        setIsActionPending(true);
        try {
            await authClient.admin.removeUser({ userId });
            toast.success("User deleted successfully");
            refetch();
            setActionToConfirm(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user");
        } finally {
            setIsActionPending(false);
        }
    };

    const handleSetRole = async (userId: string, currentRole: UserRole, newRole: UserRole, skipConfirm = false) => {

        if (!confirmDisabled && !skipConfirm) {
            const user = users.find(u => u.id === userId);
            setActionToConfirm({
                type: "role",
                userId,
                userName: user?.name || UserRoles.admin,
                data: { currentRole, newRole }
            });
            return;
        }

        setIsActionPending(true);
        try {
            await authClient.admin.setRole({ userId, role: newRole });
            toast.success(`User role updated to ${newRole}`);
            refetch();
            setActionToConfirm(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to update user role");
        } finally {
            setIsActionPending(false);
        }
    };

    const executeConfirmedAction = () => {
        if (!actionToConfirm) return;

        switch (actionToConfirm.type) {
            case "ban":
                handleBanUser(actionToConfirm.userId, false, true);
                break;
            case "unban":
                handleBanUser(actionToConfirm.userId, true, true);
                break;
            case "delete":
                handleDeleteUser(actionToConfirm.userId, true);
                break;
            case "role":
                handleSetRole(actionToConfirm.userId, actionToConfirm.data.currentRole, actionToConfirm.data.newRole, true);
                break;
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading users: {error.message}
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    User Management
                </h1>
                <p className="text-muted-foreground">
                    Manage your application users, roles, and access.
                </p>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        className="pl-9 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md sm:bg-transparent sm:p-0">
                        <Checkbox
                            id="confirm-disabled"
                            checked={confirmDisabled}
                            onCheckedChange={(checked) => setConfirmDisabled(checked === true)}
                        />
                        <Label
                            htmlFor="confirm-disabled"
                            className="text-sm font-medium leading-none cursor-pointer whitespace-nowrap"
                        >
                            Disable confirmation
                        </Label>
                    </div>
                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Rows:</span>
                            <select
                                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setOffset(0);
                                }}
                            >
                                {[5, 10, 20, 50, 100].map((v) => (
                                    <option key={v} value={v}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="ml-2">
                            <Plus className="mr-1 h-4 w-4" />
                            <span className="hidden xs:inline">Create User</span>
                            <span className="xs:hidden">Create</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none sm:border">
                <CardHeader className="px-4 py-4 sm:px-6">
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        A list of all users in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                    <div className="relative w-full overflow-x-auto border-t sm:border-none">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-muted/50 text-[10px] uppercase text-muted-foreground sm:text-xs">
                                <tr>
                                    <th
                                        className="whitespace-nowrap px-3 py-3 font-medium cursor-pointer hover:text-foreground transition-colors sm:px-4"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-1">
                                            User
                                            {sortBy === "name" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            ) : <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </th>
                                    <th
                                        className="whitespace-nowrap px-3 py-3 font-medium cursor-pointer hover:text-foreground transition-colors sm:px-4"
                                        onClick={() => handleSort("role")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Role
                                            {sortBy === "role" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            ) : <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </th>
                                    <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-4">Status</th>
                                    <th className="whitespace-nowrap px-3 py-3 font-medium text-right sm:px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isPending ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-4 sm:px-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                                        <AvatarImage src={user.image || ""} />
                                                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-medium truncate">{user.name}</span>
                                                        <span className="text-[10px] text-muted-foreground truncate sm:text-xs">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 sm:px-4">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium sm:py-1 sm:text-xs ${user.role === UserRoles.admin
                                                    ? "bg-primary/10 text-primary"
                                                    : user.role === UserRoles.owner || user.role === UserRoles.super_owner
                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                        : "bg-muted text-muted-foreground"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 sm:px-4">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium sm:py-1 sm:text-xs ${user.banned
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    }`}>
                                                    {user.banned ? "Banned" : "Active"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-right sm:px-4">
                                                <div className="flex justify-end gap-2">
                                                    {user.permissions.canPromoteToOwner && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title={user.role === UserRoles.owner ? "Demote to User" : "Promote to owner"}
                                                            onClick={() => handleSetRole(user.id, user.role as UserRole,
                                                                user.role === UserRoles.owner ? UserRoles.admin : UserRoles.owner
                                                            )}
                                                        >
                                                            {user.role === UserRoles.owner ? (
                                                                <KeyRound className="h-4 w-4 text-amber-500" />
                                                            ) : (
                                                                <Key className="h-4 w-4 opacity-40" />
                                                            )}
                                                        </Button>
                                                    )}

                                                    {user.permissions.canChangeGeneralRole && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title={user.role === UserRoles.admin ? "Demote to User" : "Promote to Admin"}
                                                            onClick={() => handleSetRole(user.id, user.role as UserRole, user.role === UserRoles.admin ? UserRoles.user : UserRoles.admin)}
                                                        >
                                                            {user.role === UserRoles.admin ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                        </Button>
                                                    )}

                                                    {user.permissions.canBan && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className={user.banned ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"}
                                                            title={user.banned ? "Unban User" : "Ban User"}
                                                            onClick={() => handleBanUser(user.id, user.banned || false)}
                                                        >
                                                            {user.banned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                                        </Button>
                                                    )}

                                                    {user.permissions.canDelete && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700"
                                                            title="Delete User"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                                }

                            </tbody>
                        </table>
                    </div>

                    {totalUsers > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-4">
                            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                                Showing <span className="font-medium">{offset + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min(offset + limit, adjustedTotalUsers)}
                                </span>{" "}
                                of <span className="font-medium">{adjustedTotalUsers}</span>
                            </div>
                            <div className="flex items-center gap-1 order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={offset === 0}
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                    className="h-8 px-2 sm:px-3"
                                >
                                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Previous</span>
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(currentPage > 3 ? 3 : 5, totalPages) }, (_, i) => {
                                        let pageNum = currentPage;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else {
                                            if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 1 + i; // Show fewer on mobile
                                        }

                                        if (pageNum > totalPages) return null;

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setOffset((pageNum - 1) * limit)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={offset + limit >= adjustedTotalUsers}
                                    onClick={() => setOffset(offset + limit)}
                                    className="h-8 px-2 sm:px-3"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleCreateUser}>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the system. They will be able to sign in with these credentials.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input
                                    id="first-name"
                                    placeholder="Enter first name"
                                    required
                                    autoComplete="off"
                                    onChange={(e) => {
                                        setNewFirstName(e.target.value);
                                    }}
                                    value={newFirstName}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input
                                    id="last-name"
                                    placeholder="Enter last name"
                                    required
                                    autoComplete="off"

                                    onChange={(e) => {
                                        setNewLastName(e.target.value);
                                    }}
                                    value={newLastName}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    autoComplete="off"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"

                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                disabled={isCreatingUser}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreatingUser}>
                                {isCreatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create User
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={actionToConfirm !== null} onOpenChange={(open) => !open && setActionToConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionToConfirm?.type === "ban" && "Ban User"}
                            {actionToConfirm?.type === "unban" && "Unban User"}
                            {actionToConfirm?.type === "delete" && "Delete User"}
                            {actionToConfirm?.type === "role" && "Change User Role"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionToConfirm?.type === "ban" && <span>Are you sure you want to ban <span className="font-bold text-gray-800">{actionToConfirm.userName}</span>? They will no longer be able to sign in.</span>}
                            {actionToConfirm?.type === "unban" && <span>Are you sure you want to unban <span className="font-bold text-gray-800">{actionToConfirm.userName}</span>? </span>}
                            {actionToConfirm?.type === "delete" && <span>Are you sure you want to delete <span className="font-bold text-gray-800">{actionToConfirm.userName}</span>? This action cannot be undone.</span>}
                            {actionToConfirm?.type === "role" && <span>Are you sure you want to change <span className="font-bold text-gray-800">{actionToConfirm.userName}</span>'s role from <span className="font-bold">{actionToConfirm.data?.currentRole}</span> to <span className="font-medium">{actionToConfirm.data?.newRole}</span>? </span>}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionToConfirm(null)}
                            disabled={isActionPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionToConfirm?.type === "delete" || actionToConfirm?.type === "ban" ? "destructive" : "default"}
                            onClick={executeConfirmedAction}
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
        </div >
    );
}
