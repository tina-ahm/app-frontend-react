import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { PdfActions } from 'src/features/pdf/data/pdfSlice';
import { QueueActions } from 'src/features/queue/queueSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useApplicationMetadata } from 'src/hooks/useApplicationMetadata';
import { useApplicationSettings } from 'src/hooks/useApplicationSettings';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useFooterLayout } from 'src/hooks/useFooterLayout';
import { useLayoutSetsQuery } from 'src/hooks/useLayoutSets';
import { useOrgs } from 'src/hooks/useOrgs';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { makeGetHasErrorsSelector } from 'src/selectors/getErrors';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { httpGet } from 'src/utils/network/networking';
import { shouldGeneratePdf } from 'src/utils/pdf';
import { getEnvironmentLoginUrl, refreshJwtTokenUrl } from 'src/utils/urls/appUrlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IApplicationSettings } from 'src/types/shared';

// 1 minute = 60.000ms
const TEN_MINUTE_IN_MILLISECONDS: number = 60000 * 10;

export const App = (): JSX.Element => <AppStartup />;

const AppStartup = (): JSX.Element => {
  const { data: applicationSettings, isError: hasApplicationSettingsError } = useApplicationSettings();
  const { data: applicationMetadata, isError: hasApplicationMetadataError } = useApplicationMetadata();
  const { data: layoutSets, isError: hasLayoutSetError } = useLayoutSetsQuery();
  const { data: orgs, isError: hasOrgsError } = useOrgs();
  const { data: _, isError: hasFooterError } = useFooterLayout({
    enabled: !!applicationMetadata?.features?.footer,
  });

  const componentIsReady = applicationSettings && applicationMetadata && orgs && layoutSets;

  const componentHasErrors =
    hasApplicationSettingsError || hasApplicationMetadataError || hasOrgsError || hasFooterError || hasLayoutSetError;

  if (componentHasErrors) {
    return <h1>Should display error page</h1>;
  }

  if (componentIsReady) {
    return (
      <AppInternal
        applicationSettings={applicationSettings}
        applicationMetadata={applicationMetadata}
      />
    );
  }

  return <h1>Should display spinner while loading the app</h1>;
};

type AppInternalProps = {
  applicationSettings: IApplicationSettings;
  applicationMetadata: IApplicationMetadata;
};
const AppInternal = ({ applicationSettings, applicationMetadata }: AppInternalProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const hasErrorSelector = makeGetHasErrorsSelector();
  const hasApiErrors: boolean = useAppSelector(hasErrorSelector);
  const appOidcProvider = applicationSettings.appOidcProvider;
  const lastRefreshTokenTimestamp = React.useRef(0);

  const allowAnonymousSelector = makeGetAllowAnonymousSelector();
  const allowAnonymous: boolean = useAppSelector(allowAnonymousSelector);

  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);

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

  React.useEffect(() => {
    function setUpEventListeners() {
      window.addEventListener('mousemove', refreshJwtToken);
      window.addEventListener('scroll', refreshJwtToken);
      window.addEventListener('onfocus', refreshJwtToken);
      window.addEventListener('keydown', refreshJwtToken);
      window.addEventListener('hashchange', setPdfState);
    }

    function removeEventListeners() {
      window.removeEventListener('mousemove', refreshJwtToken);
      window.removeEventListener('scroll', refreshJwtToken);
      window.removeEventListener('onfocus', refreshJwtToken);
      window.removeEventListener('keydown', refreshJwtToken);
      window.removeEventListener('hashchange', setPdfState);
    }

    function setPdfState() {
      if (shouldGeneratePdf()) {
        dispatch(PdfActions.pdfStateChanged());
      }
    }

    function refreshJwtToken() {
      const timeNow = Date.now();
      if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTE_IN_MILLISECONDS) {
        lastRefreshTokenTimestamp.current = timeNow;
        httpGet(refreshJwtTokenUrl).catch((err) => {
          // Most likely the user has an expired token, so we redirect to the login-page
          try {
            window.location.href = getEnvironmentLoginUrl(appOidcProvider || null);
          } catch (error) {
            console.error(err, error);
          }
        });
      }
    }

    if (allowAnonymous === false) {
      refreshJwtToken();
      dispatch(QueueActions.startInitialUserTaskQueue());
      setUpEventListeners();

      return () => {
        removeEventListeners();
      };
    }
  }, [allowAnonymous, dispatch, appOidcProvider]);

  React.useEffect(() => {
    dispatch(QueueActions.startInitialAppTaskQueue());
  }, [dispatch]);

  if (hasApiErrors) {
    return <UnknownError />;
  }

  // Page is ready to be rendered once allowAnonymous value has been determined
  const ready = allowAnonymous !== undefined;
  if (!ready) {
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
