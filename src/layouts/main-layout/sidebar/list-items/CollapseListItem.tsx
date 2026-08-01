import { useState } from 'react';
import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router-dom';
import useColorMode from 'hooks/useColorMode';

const CollapseListItem = ({ subheader, items, icon }: MenuItem) => {
  const { mode } = useColorMode();
  const location = useLocation();
  const currentPath = location.pathname;
  const isAnyChildActive = items?.some(child => currentPath === child.path) ?? false;
  const [open, setOpen] = useState(isAnyChildActive);

  const parentActiveBg = mode === 'dark' ? '#10241A' : '#F1F5F9';
  const parentHoverBg = mode === 'dark' ? '#0E1D15' : '#F8FAFC';
  const parentActiveColor = mode === 'dark' ? '#4ADE80' : '#0F172A';
  const parentInactiveColor = mode === 'dark' ? '#CBD5E1' : '#334155';
  const parentIconColor = isAnyChildActive ? (mode === 'dark' ? '#4ADE80' : '#0F172A') : (mode === 'dark' ? '#94A3B8' : '#64748B');

  return (
    <>
      {/* ── Parent button ─────────────────────────────────────────── */}
      <ListItemButton
        onClick={() => setOpen(prev => !prev)}
        sx={{
          mb: 0.5,
          borderRadius: '10px',
          px: 1.5,
          py: 0.875,
          backgroundColor: isAnyChildActive ? parentActiveBg : 'transparent',
          border: isAnyChildActive && mode === 'dark' ? '1px solid #15271E' : '1px solid transparent',
          '&:hover': {
            backgroundColor: isAnyChildActive ? (mode === 'dark' ? '#162E22' : '#E2E8F0') : parentHoverBg,
          },
          transition: 'all 120ms ease',
        }}
      >
        <ListItemIcon sx={{ minWidth: 28 }}>
          {icon && (
            <IconifyIcon
              icon={icon}
              width={18}
              height={18}
              sx={{ color: `${parentIconColor} !important` }}
            />
          )}
        </ListItemIcon>
        <ListItemText
          disableTypography
          primary={
            <Box
              component="span"
              sx={{
                fontSize: '0.875rem',
                fontWeight: isAnyChildActive ? 600 : 500,
                color: `${isAnyChildActive ? parentActiveColor : parentInactiveColor} !important`,
                fontFamily: '"Geist", sans-serif',
              }}
            >
              {subheader}
            </Box>
          }
        />
        <IconifyIcon
          icon="solar:alt-arrow-down-linear"
          width={16}
          height={16}
          sx={{
            color: `${mode === 'dark' ? '#94A3B8' : '#64748B'} !important`,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </ListItemButton>

      {/* ── Sub-items ─────────────────────────────────────────────── */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 12,
                top: 4,
                bottom: 4,
                width: '1px',
                backgroundColor: mode === 'dark' ? '#15271E' : '#E5E7EB',
              },
            }}
          >
            {items?.map((route) => {
              const isActive = currentPath === route.path;
              const childActiveBg = mode === 'dark' ? '#10241A' : '#F1F5F9';
              const childHoverBg = isActive
                ? (mode === 'dark' ? '#162E22' : '#E2E8F0')
                : (mode === 'dark' ? '#0E1D15' : '#F8FAFC');
              const childActiveColor = mode === 'dark' ? '#4ADE80' : '#0F172A';
              const childInactiveColor = mode === 'dark' ? '#94A3B8' : '#64748B';

              return (
                <ListItemButton
                  key={route.pathName}
                  component={Link}
                  href={route.path}
                  sx={{
                    pl: 3,
                    pr: 1.5,
                    py: 0.75,
                    mb: 0.25,
                    borderRadius: '8px',
                    backgroundColor: isActive ? childActiveBg : 'transparent',
                    border: isActive && mode === 'dark' ? '1px solid #15271E' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: childHoverBg,
                    },
                    transition: 'all 120ms ease',
                  }}
                >
                  {/* Dot indicator */}
                  <Box
                    sx={{
                      width: isActive ? 5 : 4,
                      height: isActive ? 5 : 4,
                      borderRadius: '50%',
                      backgroundColor: isActive ? (mode === 'dark' ? '#4ADE80' : '#0F172A') : (mode === 'dark' ? '#4B6356' : '#94A3B8'),
                      mr: 1.25,
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  />
                  <ListItemText
                    disableTypography
                    primary={
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 400,
                          color: `${isActive ? childActiveColor : childInactiveColor} !important`,
                          fontFamily: '"Geist", sans-serif',
                          display: 'block',
                        }}
                      >
                        {route.name}
                      </Box>
                    }
                  />
                </ListItemButton>
              );
            })}
          </Box>
        </List>
      </Collapse>
    </>
  );
};

export default CollapseListItem;
