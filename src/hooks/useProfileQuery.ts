import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { IProfile } from 'src/types/shared';

enum ServerStateCacheKey {
  UserProfile = 'GET_USER_PROFILE',
}
export const useProfileQuery = (enabled?: boolean): UseQueryResult<IProfile> => {
  const { fetchUserProfile } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.UserProfile], fetchUserProfile, { enabled });
};
