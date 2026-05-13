import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme as baseTheme } from 'theme/theme';

type Mode = 'light' | 'dark';

const THEME_CHANGE_EVENT = 'theme-mode-change';

interface ColorModeContextValue {
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggle: () => {},
  setMode: () => {},
});

// Precompute themes once to avoid heavy createTheme on every toggle
const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
  },
});

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'dark',
    background: {
      default: '#0A0F0D',
      paper: '#0D1410',
    },
    text: {
      primary: '#EAF7EE',
      secondary: '#94A3B8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  components: {
    ...baseTheme.components,
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.08)',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#EAF7EE',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#111714',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#DFFFE3',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: '#DFFFE3',
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(22, 163, 74, 0.08)',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0B1310',
          },
          '& .MuiTablePagination-root': {
            color: '#DFFFE3',
          },
          '& .MuiIconButton-root': {
            color: '#94A3B8',
          },
        },
      },
    },
  },
});

export const ColorModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const stored = localStorage.getItem('app-color-mode');
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#0B1310';
      document.body.style.color = '#EAF7EE';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    try {
      localStorage.setItem('app-color-mode', mode);
      window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: mode }));
    } catch {}
  }, [mode]);

  // Listen for external theme change events and update provider state
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Mode>;
      if (customEvent?.detail && (customEvent.detail === 'dark' || customEvent.detail === 'light')) {
        setMode(customEvent.detail);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const toggle = useCallback(() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggle, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const useColorMode = () => useContext(ColorModeContext);

export default useColorMode;
