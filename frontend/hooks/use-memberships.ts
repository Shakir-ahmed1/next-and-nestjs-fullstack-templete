import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

interface Membership {
    id: string;
    role: string;
    organization: {
        id: string;
        slug: string;
        name: string;
        logo: string;
    };
}
export const useUserMemberships = () => {
    return useQuery({
        queryKey: ['memberships'],
    queryFn: async (): Promise<Membership[]> => {
      const { data } = await api.get<Membership[]>('/members/user-memberships');
      return data;
    },

    })
}