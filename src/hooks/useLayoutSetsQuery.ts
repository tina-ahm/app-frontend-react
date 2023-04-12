import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { ILayoutSets } from 'src/types';

enum ServerStateCacheKey {
  LayoutSets = 'LAYOUT_SETS',
}
export const useLayoutSetsQuery = (): UseQueryResult<ILayoutSets> => {
  const dispatch = useAppDispatch();
  const { fetchLayoutSets } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.LayoutSets], fetchLayoutSets, {
    onSuccess: (layoutSets) => {
      dispatch(FormLayoutActions.fetchSetsFulfilled({ layoutSets }));
    },
  });
};
