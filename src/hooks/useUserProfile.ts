import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import { UserProfile } from '../types/user.interface';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from './useWalletBalance';

export function useUserProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: UserService.getProfile,
    staleTime: 300000, // Consider profile data stale after 5 minutes
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch profile: ${error.message}`);
      return false;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<UserProfile>) => UserService.updateProfile(updates),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate
  };
} 