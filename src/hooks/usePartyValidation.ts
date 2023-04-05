import { useMutation } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';

export const usePartyValidation = () => {
  const { getPartyValidation } = useAppServicesContext();
  return useMutation((partyId: string) => getPartyValidation(partyId));
};
