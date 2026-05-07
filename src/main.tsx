import React from 'react';
import ReactDOM from 'react-dom/client';
import router from 'routes/router';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from 'theme/theme.ts';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SnackbarProvider } from 'notistack';
import { PersistGate } from 'redux-persist/integration/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ScreenGuard from 'screenGuard';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SnackbarProvider maxSnack={3}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ScreenGuard>
                  <RouterProvider router={router} />
                </ScreenGuard>
              </LocalizationProvider>
              {import.meta.env.MODE === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </ThemeProvider>
          </SnackbarProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);
