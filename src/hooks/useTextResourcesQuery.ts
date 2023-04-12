import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { ITextResource } from 'src/types/shared';

enum ServerStateCacheKey {
  TextResources = 'textResources',
  DeprecatedTextResources = 'deprecatedTextResources',
}

export const useTextResourcesQuery = (appLanguage: string): UseQueryResult<ITextResource> => {
  const query = useTextResourcesQueryLatest(appLanguage);
  const deprecatedQuery = useTextResourcesQueryDeprecated(query.isError);

  return query.isSuccess ? query : deprecatedQuery;
};

const useTextResourcesQueryLatest = (appLanguage: string): UseQueryResult<ITextResource> => {
  const { fetchTextResources } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.TextResources], () => fetchTextResources(appLanguage));
};

const useTextResourcesQueryDeprecated = (enabled: boolean): UseQueryResult<ITextResource> => {
  const { fetchTextResources } = useAppServicesContext();
  const shouldUseDeprecatedEndpoint = true;
  return useQuery(
    [ServerStateCacheKey.DeprecatedTextResources],
    () => fetchTextResources('', shouldUseDeprecatedEndpoint),
    { enabled },
  );
};
