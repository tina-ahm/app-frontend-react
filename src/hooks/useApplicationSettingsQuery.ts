import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { ApplicationSettingsActions } from 'src/features/applicationSettings/applicationSettingsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IApplicationSettings } from 'src/types/shared';

enum ServerStateCacheKey {
  ApplicationSettings = 'APPLICATION_SETTINGS',
}

export const useApplicationSettingsQuery = (): UseQueryResult<IApplicationSettings, unknown> => {
  const dispatch = useAppDispatch();
  const { fetchApplicationSettings } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.ApplicationSettings], fetchApplicationSettings, {
    onSuccess: (settings) => {
      dispatch(ApplicationSettingsActions.fetchApplicationSettingsFulfilled({ settings }));
    },
  });
};
