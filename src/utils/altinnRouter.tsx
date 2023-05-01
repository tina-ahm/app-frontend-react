import React from 'react';
import { createBrowserRouter, HashRouter, Route, RouterProvider, Routes } from 'react-router-dom';

import { ProcessWrapper } from 'src/components/wrappers/ProcessWrapper';
import { Entrypoint } from 'src/features/entrypoint/Entrypoint';
import { PartySelection } from 'src/features/instantiate/containers/PartySelection';

const [org, appName] = window.location.pathname.split('/').filter(Boolean);
const routerRoot = `/${org}/${appName}`;

enum RouterPaths {
  Entrypoint = '/',
  PartySelection = '/partyselection/*',
  ProcessWrapper = '/instance/:partyId/:instanceGuid',
}

const createAltinnBrowserRouter = (allowAnonymous: boolean) =>
  createBrowserRouter([
    {
      path: `${routerRoot}${RouterPaths.Entrypoint}`,
      element: <Entrypoint allowAnonymous={allowAnonymous} />,
    },
    {
      path: `${routerRoot}${RouterPaths.PartySelection}}`,
      element: <PartySelection />,
    },
    {
      path: `${routerRoot}${RouterPaths.ProcessWrapper}`,
      element: <ProcessWrapper />,
    },
  ]);

type LegacyRouterProps = {
  allowAnonymous: boolean;
};
const LegacyRouter = ({ allowAnonymous }: LegacyRouterProps): JSX.Element => (
  <HashRouter>
    <Routes>
      <Route
        path={RouterPaths.Entrypoint}
        element={<Entrypoint allowAnonymous={allowAnonymous} />}
      />
      <Route
        path={RouterPaths.PartySelection}
        element={<PartySelection />}
      />
      <Route
        path={RouterPaths.ProcessWrapper}
        element={<ProcessWrapper />}
      />
    </Routes>
  </HashRouter>
);

export const AltinnRouter = ({
  allowAnonymous,
  shouldUseLegacyRouter,
}: {
  allowAnonymous: boolean;
  shouldUseLegacyRouter: boolean;
}): JSX.Element => {
  if (shouldUseLegacyRouter) {
    return <LegacyRouter allowAnonymous={allowAnonymous} />;
  }

  return <RouterProvider router={createAltinnBrowserRouter(allowAnonymous)} />;
};

export const isLegacyUrl = (url: string): boolean => url.charAt(0) === '#';

export const redirectLegacyToNewUrl = (legacyRoute: string): void => {
  window.location.href = createNewUrlFromLegacyUrl(legacyRoute);
};

export const createNewUrlFromLegacyUrl = (legacyRoute: string): string => {
  // Remove the hash from the url to get the new route based on legacy route
  const removeHashFromUrl = (url: string): string => url.split('/').slice(1).join('/');
  return window.location.pathname + removeHashFromUrl(legacyRoute);
};
