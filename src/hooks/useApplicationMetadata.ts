import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';

enum ServerStateCacheKey {
  ApplicationMetadata = 'ApplicationMetadata',
}

export const useApplicationMetadata = (): UseQueryResult<IApplicationMetadata, unknown> => {
  const { fetchApplicationMetadata } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.ApplicationMetadata], fetchApplicationMetadata);
};
