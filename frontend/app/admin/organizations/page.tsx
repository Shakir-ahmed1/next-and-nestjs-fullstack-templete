"use client";

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
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import {
    Building2,
    Loader2,
    Trash2,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import Link from "next/link";

interface Organization {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    createdAt: string;
}

export default function AdminOrganizationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<keyof Organization>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: organizations, isPending, error, refetch } = useQuery({
        queryKey: ["admin-organizations"],
        queryFn: async () => {
            const res = await api.get<Organization[]>("/admin/organizations");
            return res.data;
        }
    });

    const handleSort = (field: keyof Organization) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
    };

    const handleDeleteOrg = async () => {
        if (!orgToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/admin/organizations/${orgToDelete.id}`);
            toast.success("Organization deleted successfully");
            refetch();
            setOrgToDelete(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete organization");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredOrgs = organizations?.filter(org =>
        org.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        org.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
    ).sort((a, b) => {
        const valA = a[sortBy] || "";
        const valB = b[sortBy] || "";
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    }) || [];

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading organizations: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    Organization Management
                </h1>
                <p className="text-muted-foreground">
                    Global overview and management of all organizations.
                </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or slug..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organizations</CardTitle>
                    <CardDescription>
                        A list of all organizations registered in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th
                                        className="px-4 py-3 font-medium cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Organization
                                            {sortBy === "name" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            ) : <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 font-medium cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort("slug")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Slug
                                            {sortBy === "slug" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            ) : <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-3 font-medium cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort("createdAt")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Created At
                                            {sortBy === "createdAt" ? (
                                                sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                            ) : <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isPending ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : filteredOrgs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            No organizations found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrgs.map((org) => (
                                        <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={org.logo || ""} />
                                                        <AvatarFallback>{org.name?.charAt(0) || "O"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{org.name}</span>
                                                        <span className="text-xs text-muted-foreground">ID: {org.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 cursor-default">
                                                <span className="font-mono text-xs">/{org.slug}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(org.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        title="View Organization"
                                                    >
                                                        <Link href={`/organizations/${org.slug}`}>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Delete Organization"
                                                        onClick={() => setOrgToDelete(org)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={orgToDelete !== null} onOpenChange={(open) => !open && setOrgToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Organization</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the organization <span className="font-bold text-gray-900">{orgToDelete?.name}</span>?
                            This action is permanent and will remove all members and associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOrgToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteOrg}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
