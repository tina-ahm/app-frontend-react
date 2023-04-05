import React from 'react';

import { createStrictContext } from 'src/utils/createStrictContext';
import type * as queries from 'src/queries/queries';

type AppServicesContext = typeof queries;

const [AppServiceProvider, useAppServicesContext] = createStrictContext<AppServicesContext>();

type AppServicesContextProviderProps = {
  children: React.ReactNode;
} & AppServicesContext;
export const AppServicesContextProvider = ({ children, ...queries }: AppServicesContextProviderProps) => (
  <AppServiceProvider value={{ ...queries }}>{children}</AppServiceProvider>
);

export { useAppServicesContext };
