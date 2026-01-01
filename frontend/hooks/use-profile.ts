// lib/queries/profile.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api'; // adjust path to your axios instance

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  
};

// 1. Fetch profile query using Axios
export const useUserProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get<User>('/profile');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

// 2. Update profile mutation using Axios
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { name: string; image?: string | null }) => {
      const { data } = await api.put<User>('/profile', updates);
      return data;
    },
    onSuccess: (updatedUser) => {
      // Optimistically update the cached profile
      queryClient.setQueryData(['profile'], updatedUser);
    },
    onError: (error: any) => {
      // Optional: you can enhance error messages here
      console.error('Profile update failed:', error);
    },
  });
};


