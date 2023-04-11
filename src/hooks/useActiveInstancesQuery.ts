import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { QueryOptions } from '@testing-library/react';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { ISimpleInstance } from 'src/types';

enum ServerStateCacheKey {
  getActiveInstances = 'GET_ACTIVE_INSTANCES',
}

export const useActiveInstancesQuery = (
  partyId: string,
  options: QueryOptions,
): UseQueryResult<ISimpleInstance[], unknown> => {
  const { fetchActiveInstances } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.getActiveInstances], () => fetchActiveInstances(partyId), { ...options });
};
