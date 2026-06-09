import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { apiRequest } from '@/lib/api';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  district: string | null;
  city: string | null;
  is_admin: boolean;
};

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Profile | null> => apiRequest<Profile>('/api/account/profile'),
  });
};

export const useUpdateProfile = () => {
  const { user, refresh } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { full_name: string; phone: string; district: string; city: string }) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }

      return apiRequest<Profile>('/api/account/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
        refresh(),
      ]);
    },
  });
};
