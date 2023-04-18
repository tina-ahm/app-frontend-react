import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { OrgsActions } from 'src/features/orgs/orgsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IAltinnOrgs } from 'src/types/shared';

enum ServerStateCacheKey {
  GetOrganizations = 'getOrganizations',
}

export const useOrgsQuery = (): UseQueryResult<IAltinnOrgs> => {
  const dispatch = useAppDispatch();
  const { fetchOrgs } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.GetOrganizations], fetchOrgs, {
    onSuccess: (orgs) => {
      dispatch(OrgsActions.fetchFulfilled({ orgs }));
    },
  });
};
