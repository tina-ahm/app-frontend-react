import React from 'react';

import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApplicationSettingsQuery } from 'src/hooks/queries/useApplicationSettingsQuery';
import { useFooterLayoutQuery } from 'src/hooks/queries/useFooterLayoutQuery';
import { useCurrentPartyQuery } from 'src/hooks/queries/useGetCurrentPartyQuery';
import { useLayoutSetsQuery } from 'src/hooks/queries/useLayoutSetsQuery';
import { useOrgsQuery } from 'src/hooks/queries/useOrgsQuery';
import { useProfileQuery } from 'src/hooks/queries/useProfileQuery';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useKeepAlive } from 'src/hooks/useKeepAlive';
import { useUpdatePdfState } from 'src/hooks/useUpdatePdfState';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { AltinnRouter, isLegacyUrl, redirectLegacyToNewUrl } from 'src/utils/altinnRouter';
import type { IApplicationSettings } from 'src/types/shared';

export const App = () => {
  const { data: applicationSettings, isError: hasApplicationSettingsError } = useApplicationSettingsQuery();
  const { data: applicationMetadata, isError: hasApplicationMetadataError } = useApplicationMetadataQuery();
  const { isError: hasLayoutSetError } = useLayoutSetsQuery();
  const { isError: hasOrgsError } = useOrgsQuery();
  useFooterLayoutQuery(!!applicationMetadata?.features?.footer);

  const componentIsReady = applicationSettings && applicationMetadata;
  const componentHasError =
    hasApplicationSettingsError || hasApplicationMetadataError || hasLayoutSetError || hasOrgsError;

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(QueueActions.startInitialAppTaskQueue());
  }, [dispatch]);

  if (componentHasError) {
    return <UnknownError />;
  }

  if (componentIsReady) {
    return <AppInternal applicationSettings={applicationSettings} />;
  }

  return null;
};

type AppInternalProps = {
  applicationSettings: IApplicationSettings;
};

const AppInternal = ({ applicationSettings }: AppInternalProps): JSX.Element | null => {
  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous: boolean = useAppSelector(allowAnonymousSelector);

  const { isError: hasProfileError } = useProfileQuery(allowAnonymous === false);
  const { isError: hasCurrentPartyError } = useCurrentPartyQuery(allowAnonymous === false);

  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);

  useKeepAlive(applicationSettings.appOidcProvider, allowAnonymous);
  useUpdatePdfState(allowAnonymous);

  const hasComponentError = hasProfileError || hasCurrentPartyError;

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

  // TODO should this be decided by the application settings?
  const shouldUseLegacyRouter = false;

  if (!shouldUseLegacyRouter) {
    const isUrlLegacy = isLegacyUrl(window.location.hash);

    if (isUrlLegacy) {
      redirectLegacyToNewUrl(window.location.hash);
      return null;
    }
  }

  const isReadyToRenderRoutes = allowAnonymous !== undefined;
  if (isReadyToRenderRoutes) {
    return (
      <AltinnRouter
        allowAnonymous={allowAnonymous}
        shouldUseLegacyRouter={shouldUseLegacyRouter}
      />
    );
  }

  if (hasComponentError) {
    return <UnknownError />;
  }

  return null;
};
