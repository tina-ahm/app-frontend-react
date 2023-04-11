import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { putWithoutConfig } from 'src/utils/network/networking';
import { invalidateCookieUrl, redirectToUpgrade } from 'src/utils/urls/appUrlHelper';

const allowedServerErrorCodes = [403];

enum ServerStateCacheKey {
  GetInstanceById = 'GET_INSTANCE_BY_ID',
}

export const useInstanceQuery = (instanceId: string, options?: UseQueryOptions) => {
  const { fetchInstanceByInstanceId } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.GetInstanceById, instanceId], () => fetchInstanceByInstanceId(instanceId), {
    ...options,
    onError: (error: AxiosError & { response: { data: { RequiredAuthenticationLevel: string } } }) => {
      if (error.response && allowedServerErrorCodes.includes(error.response.status) && error.response.data) {
        const reqAuthLevel = error.response.data.RequiredAuthenticationLevel;
        if (reqAuthLevel) {
          putWithoutConfig(invalidateCookieUrl);
          redirectToUpgrade(reqAuthLevel);
        }
      }
    },
  });
};
