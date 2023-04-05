import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import type { IAltinnOrgs } from 'src/types/shared';

export const useOrgs = (): UseQueryResult<IAltinnOrgs> => {
  const { fetchOrgs } = useAppServicesContext();
  return useQuery([], fetchOrgs);
};
