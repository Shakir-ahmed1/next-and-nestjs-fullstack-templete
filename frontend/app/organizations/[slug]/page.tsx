"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Users,
    Shield,
    UserPlus,
    Activity,
    CreditCard
} from "lucide-react";

export default function OrganizationOverviewPage() {
    const params = useParams();
    const { data: session, isPending: isSessionPending } = authClient.useSession();

    const slug = params.slug as string;
    const { data: activeOrg, isPending: isOrgPending } = authClient.useActiveOrganization();


    const { data: organization } = useQuery({
        queryKey: ["organization", slug],
        queryFn: async () => {
            const res = await authClient.organization.getFullOrganization({
                query: {
                    organizationSlug: slug
                }
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        }
    });

    const stats = [
        {
            title: "Total Members",
            value: organization?.members?.length || 0,
            icon: Users,
            description: "Active members in this organization"
        },
        {
            title: "Your Role",
            value: activeOrg?.members?.find(m => m.userId === session?.user?.id)?.role || "", // In a real app, find current user's role in organization.members
            icon: Shield,
            description: "Permissions restricted by role"
        },
        {
            title: "Pending Invites",
            value: organization?.invitations?.filter(inv => inv.status === 'pending').length || 0,
            icon: UserPlus,
            description: "Sent invitations awaiting response"
        },
        {
            title: "Active Projects",
            value: "0",
            icon: Activity,
            description: "Currently running projects"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Recent actions performed in the organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Placeholder for activity log */}
                            <div className="text-center py-8 text-muted-foreground italic">
                                No recent activity found.
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                        <CardDescription>
                            Your current organization plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 rounded-lg border p-4">
                                <CreditCard className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="font-semibold">Free Plan</p>
                                    <p className="text-xs text-muted-foreground">Up to 5 members</p>
                                </div>
                            </div>
                            <div className="text-sm text-balance">
                                Upgrade to Pro for unlimited members and advanced features.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
