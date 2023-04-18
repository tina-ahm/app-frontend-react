import { useQuery } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';

enum ServerStateCacheKey {
  GetProcess = 'getProcess',
}
export const useProcessQuery = () => {
  const { fetchProcess } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.GetProcess], fetchProcess);
};
