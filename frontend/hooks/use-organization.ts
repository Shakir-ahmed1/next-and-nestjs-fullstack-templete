import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useOrganization = (slug: string) => {
    return useQuery({
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
}

export const useOrganizationMembers = (organizationId: string) => {
    return useQuery({
        queryKey: ["organization-members", organizationId],
        queryFn: async () => {
            const res = await authClient.organization.listMembers({
                query: {
                    organizationId: organizationId
                }
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        }
    });
}

export const useCurrentActiveOrgMember = () => {
    const { data: session } = authClient.useSession();
    const { data: activeOrg } = authClient.useActiveOrganization();
    return activeOrg?.members?.find(m => m.user?.id === session?.user?.id);
}