import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useGetAllowAnonymous } from 'src/hooks/useAllowAnonymous';
import { useApplicationMetadataQuery } from 'src/hooks/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/useApplicationSettingsQuery';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useFooterLayoutQuery } from 'src/hooks/useFooterLayoutQuery';
import { useKeepAlive } from 'src/hooks/useKeepAlive';
import { useLayoutSetsQuery } from 'src/hooks/useLayoutSetsQuery';
import { useOrgsQuery } from 'src/hooks/useOrgsQuery';
import { useProfileQuery } from 'src/hooks/useProfileQuery';
import { useSelectedPartyQuery } from 'src/hooks/useSelectedPartyQuery';
import { useTextResourcesQuery } from 'src/hooks/useTextResourcesQuery';
import { useUpdatePdfState } from 'src/hooks/useUpdatePdfState';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { ILayoutSets } from 'src/types';
import type { IApplicationSettings } from 'src/types/shared';

export const App = (): JSX.Element => <AppStartup />;

const AppStartup = (): JSX.Element | null => {
  const { data: applicationSettings, isError: hasApplicationSettingsError } = useApplicationSettingsQuery();
  const { data: applicationMetadata, isError: hasApplicationMetadataError } = useApplicationMetadataQuery();
  const { data: layoutSets, isError: hasLayoutSetError } = useLayoutSetsQuery();
  // TODO get the language based on the language-selector or profile
  const { data: textResources, isError: isTextResourcesError } = useTextResourcesQuery('nb');
  const { data: orgs, isError: hasOrgsError } = useOrgsQuery();
  const { data: _, isError: hasFooterError } = useFooterLayoutQuery(!!applicationMetadata?.features?.footer);

  const componentIsReady = applicationSettings && applicationMetadata && orgs && layoutSets && textResources;

  const componentHasErrors =
    hasApplicationSettingsError ||
    hasApplicationMetadataError ||
    hasOrgsError ||
    hasFooterError ||
    hasLayoutSetError ||
    isTextResourcesError;

  if (componentHasErrors) {
    return <UnknownError />;
  }

  if (componentIsReady) {
    return (
      <AppInternal
        applicationSettings={applicationSettings}
        applicationMetadata={applicationMetadata}
        layoutSets={layoutSets}
      />
    );
  }

  // Display blank page while loading
  return null;
};

type AppInternalProps = {
  applicationSettings: IApplicationSettings;
  applicationMetadata: IApplicationMetadata;
  layoutSets: ILayoutSets;
};
const AppInternal = ({
  applicationSettings,
  applicationMetadata,
  layoutSets,
}: AppInternalProps): JSX.Element | null => {
  const allowAnonymous = useGetAllowAnonymous(applicationMetadata, layoutSets);
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  useProfileQuery(allowAnonymous === false);
  useSelectedPartyQuery(allowAnonymous === false);
  useKeepAlive(applicationSettings.appOidcProvider, allowAnonymous);
  useUpdatePdfState(allowAnonymous);

  // Set the title of the app
  React.useEffect(() => {
    if (appName && appOwner) {
      document.title = `${appName} • ${appOwner}`;
    } else if (appName && !appOwner) {
      document.title = appName;
    } else if (!appName && appOwner) {
      document.title = appOwner;
    }
  }, [appOwner, appName]);

  // Ready to be rendered once allowAnonymous value has been determined
  const isPageReadyToRender = allowAnonymous !== undefined;
  if (!isPageReadyToRender) {
    return null;
  }
  return (
    <>
      <Routes>
        <Route
          path='/'
          element={
            <Entrypoint
              allowAnonymous={allowAnonymous}
              applicationMetadata={applicationMetadata}
            />
          }
        />
        <Route
          path='/partyselection/*'
          element={<PartySelection />}
        />
        <Route
          path='/instance/:partyId/:instanceGuid'
          element={<ProcessWrapper />}
        />
      </Routes>
    </>
  );
};
