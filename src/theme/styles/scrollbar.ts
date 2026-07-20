import { Theme } from '@mui/material';

const scrollbar = (theme: Theme) => {
  void theme;

  return {
  '@supports (-moz-appearance:none)': {
    scrollbarColor: '#C3E6D3 transparent',
    scrollbarWidth: 'thin' as const,
  },
  '*::-webkit-scrollbar': {
    width: 6,
    height: 6,
    WebkitAppearance: 'none',
    backgroundColor: 'transparent',
  },
  '*::-webkit-scrollbar-track': {
    background: 'transparent',
    margin: '4px 0',
  },
  '*::-webkit-scrollbar-thumb': {
    borderRadius: 3,
    backgroundColor: '#C3E6D3',
    transition: 'background-color 0.2s ease',
  },
  '*::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#7ECBA5',
  },
  };
};

export default scrollbar;
