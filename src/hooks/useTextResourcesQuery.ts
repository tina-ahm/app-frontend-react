import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { ITextResource } from 'src/types/shared';

enum ServerStateCacheKey {
  TextResources = 'textResources',
  LegacyTextResources = 'legacyTextResources',
}

export const useTextResourcesQuery = (appLanguage: string): UseQueryResult<ITextResource> => {
  const query = useTextResourcesQueryLatest(appLanguage);
  const legacyQuery = useLegacyTextResourcesQuery(query.isError);

  return query.isSuccess ? query : legacyQuery;
};

const useTextResourcesQueryLatest = (appLanguage: string) => {
  const dispatch = useAppDispatch();
  const { fetchTextResources } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.TextResources], () => fetchTextResources(appLanguage), {
    onSuccess: ({ language, resources }) => dispatch(TextResourcesActions.fetchFulfilled({ language, resources })),
  });
};

const useLegacyTextResourcesQuery = (enabled: boolean) => {
  const dispatch = useAppDispatch();

  const { fetchTextResources } = useAppServicesContext();
  const shouldUseLegacyEndpoint = true;
  return useQuery([ServerStateCacheKey.LegacyTextResources], () => fetchTextResources('', shouldUseLegacyEndpoint), {
    enabled,
    onSuccess: ({ language, resources }) => dispatch(TextResourcesActions.fetchFulfilled({ language, resources })),
  });
};
