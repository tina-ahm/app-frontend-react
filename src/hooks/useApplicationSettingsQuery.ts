import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { ApplicationSettingsActions } from 'src/features/applicationSettings/applicationSettingsSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IApplicationSettings } from 'src/types/shared';

enum ServerStateCacheKey {
  GetApplicationSettings = 'getApplicationSettings',
}

export const useApplicationSettingsQuery = (): UseQueryResult<IApplicationSettings, unknown> => {
  const dispatch = useAppDispatch();
  const { fetchApplicationSettings } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.GetApplicationSettings], fetchApplicationSettings, {
    onSuccess: (settings) => {
      dispatch(ApplicationSettingsActions.fetchApplicationSettingsFulfilled({ settings }));
    },
  });
};
