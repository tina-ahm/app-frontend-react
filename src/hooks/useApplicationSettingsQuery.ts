import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { IApplicationSettings } from 'src/types/shared';

enum ServerStateCacheKey {
  ApplicationSettings = 'APPLICATION_SETTINGS',
}

export const useApplicationSettingsQuery = (): UseQueryResult<IApplicationSettings, unknown> => {
  const { fetchApplicationSettings } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.ApplicationSettings], fetchApplicationSettings);
};
