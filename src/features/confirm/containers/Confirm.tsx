import React from 'react';

import { AltinnContentIconReceipt } from 'src/components/atoms/AltinnContentIconReceipt';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { ConfirmPage } from 'src/features/confirm/containers/ConfirmPage';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { useInstanceQuery } from 'src/hooks/useInstanceQuery';
import { selectAppName } from 'src/selectors/language';

export const Confirm = () => {
  const { instanceId } = useInstanceIdParams();
  useInstanceQuery(instanceId || '', { enabled: !!instanceId });

  const pageProps = {
    instance: useAppSelector((state) => state.instanceData.instance),
    parties: useAppSelector((state) => state.party.parties),
    applicationMetadata: useAppSelector((state) => state.applicationMetadata.applicationMetadata),
    language: useAppSelector((state) => state.language.language),
    appName: useAppSelector(selectAppName),
    textResources: useAppSelector((state) => state.textResources.resources),
  };

  const { instance, parties } = pageProps;
  const isLoading = !instance || !parties;
  return (
    <div id='confirmcontainer'>
      {isLoading ? (
        <AltinnContentLoader
          width={705}
          height={561}
        >
          <AltinnContentIconReceipt />
        </AltinnContentLoader>
      ) : (
        <ConfirmPage {...pageProps} />
      )}
    </div>
  );
};
