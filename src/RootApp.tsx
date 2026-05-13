import React from 'react';
import router from 'routes/router';
import { RouterProvider } from 'react-router-dom';
import { ColorModeProvider } from 'hooks/useColorMode';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SnackbarProvider } from 'notistack';
import { PersistGate } from 'redux-persist/integration/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ScreenGuard from 'screenGuard';
import ErrorBoundary from 'components/common/ErrorBoundary';

const queryClient = new QueryClient();

// ColorModeProvider handles theme selection and provides `useColorMode` hook

const RootApp = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <SnackbarProvider maxSnack={3}>
                <ColorModeProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <ScreenGuard>
                      <RouterProvider router={router} />
                    </ScreenGuard>
                  </LocalizationProvider>
                  {import.meta.env.MODE === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} />
                  )}
                </ColorModeProvider>
              </SnackbarProvider>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default RootApp;
