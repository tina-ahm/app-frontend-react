// Needed for "useBuiltIns": "entry" in babel.config.json to resolve
// all the polyfills we need and inject them here
import 'core-js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { AppWrapper } from '@altinn/altinn-design-system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { App } from 'src/App';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ThemeWrapper } from 'src/components/ThemeWrapper';
import { AppServicesContextProvider } from 'src/contexts/appServiceContext';
import * as queries from 'src/queries/queries';
import { initSagas } from 'src/redux/sagas';
import { setupStore } from 'src/redux/store';
import { ExprContextWrapper } from 'src/utils/layout/ExprContext';

import 'src/index.css';

document.addEventListener('DOMContentLoaded', () => {
  const { store, sagaMiddleware } = setupStore();
  initSagas(sagaMiddleware);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(
    <Provider store={store}>
      <HashRouter>
        <AppWrapper>
          <ThemeWrapper>
            <ErrorBoundary>
              <QueryClientProvider client={queryClient}>
                <AppServicesContextProvider {...queries}>
                  <ExprContextWrapper>
                    <App />
                  </ExprContextWrapper>
                </AppServicesContextProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </ErrorBoundary>
          </ThemeWrapper>
        </AppWrapper>
      </HashRouter>
    </Provider>,
  );
});
