import { useQuery } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { PartyActions } from 'src/features/party/partySlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';

enum ServerStateCacheKey {
  CurrentParty = 'currentParty',
}
export const useSelectedPartyQuery = (enabled?: boolean) => {
  const dispatch = useAppDispatch();
  const { fetchCurrentParty } = useAppServicesContext();
  return useQuery([ServerStateCacheKey.CurrentParty], fetchCurrentParty, {
    enabled,
    onSuccess: (party) => {
      dispatch(PartyActions.selectPartyFulfilled({ party }));
    },
  });
};
