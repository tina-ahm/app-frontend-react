import { useQuery } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';

enum ServerStateCacheKey {
  process = 'PROCESS',
}
export const useProcessQuery = () => {
  const { fetchProcess } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.process], fetchProcess);
};
