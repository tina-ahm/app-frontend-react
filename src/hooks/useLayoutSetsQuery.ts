import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { ILayoutSets } from 'src/types';

enum ServerStateCacheKey {
  LayoutSets = 'LAYOUT_SETS',
}
export const useLayoutSetsQuery = (): UseQueryResult<ILayoutSets> => {
  const { fetchLayoutSets } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.LayoutSets], fetchLayoutSets);
};
