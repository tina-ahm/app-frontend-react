import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { ProfileActions } from 'src/features/profile/profileSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IProfile } from 'src/types/shared';

enum ServerStateCacheKey {
  GetUserProfile = 'getUserProfile',
}
export const useProfileQuery = (enabled?: boolean): UseQueryResult<IProfile> => {
  const dispatch = useAppDispatch();
  const { fetchUserProfile } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.GetUserProfile], fetchUserProfile, {
    enabled,
    onSuccess: (profile) => {
      dispatch(ProfileActions.fetchFulfilled({ profile }));
    },
  });
};
