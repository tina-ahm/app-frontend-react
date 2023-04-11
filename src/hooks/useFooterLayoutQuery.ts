import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { QueryOptions } from '@testing-library/react';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { IFooterLayout } from 'src/features/footer/types';

enum ServerStateCacheKey {
  FetchFooterLayout = 'GET_FOOTER_LAYOUT',
}

export const useFooterLayoutQuery = (options: QueryOptions): UseQueryResult<IFooterLayout> => {
  const { fetchFooterLayout } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.FetchFooterLayout], fetchFooterLayout, { ...options });
};
