import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { FooterLayoutActions } from 'src/features/footer/data/footerLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IFooterLayout } from 'src/features/footer/types';

enum ServerStateCacheKey {
  FetchFooterLayout = 'GET_FOOTER_LAYOUT',
}

export const useFooterLayoutQuery = (enabled?: boolean): UseQueryResult<IFooterLayout> => {
  const dispatch = useAppDispatch();
  const { fetchFooterLayout } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.FetchFooterLayout], fetchFooterLayout, {
    enabled,
    onSuccess: (footerLayout) => {
      dispatch(FooterLayoutActions.fetchFulfilled({ footerLayout }));
    },
  });
};
