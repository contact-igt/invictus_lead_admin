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

const CollapseListItem = ({ subheader, items, icon }: MenuItem) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAnyChildActive = items?.some(child => currentPath === child.path) ?? false;
  const [open, setOpen] = useState(isAnyChildActive);

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
          backgroundColor: isAnyChildActive ? '#F1F5F9' : 'transparent',
          '&:hover': {
            backgroundColor: '#F8FAFC',
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
              sx={{ color: isAnyChildActive ? '#0F172A !important' : '#64748B !important' }}
            />
          )}
        </ListItemIcon>
        <ListItemText
          disableTypography
          primary={
            <Box
              component="span"
              sx={{
                fontSize: '0.875rem', // 14px Sidebar Spec
                fontWeight: isAnyChildActive ? 600 : 500, // 500 Spec
                color: isAnyChildActive ? '#0F172A !important' : '#334155 !important',
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
            color: '#64748B !important',
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
                backgroundColor: '#E5E7EB',
              },
            }}
          >
            {items?.map((route) => {
              const isActive = currentPath === route.path;
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
                    backgroundColor: isActive ? '#F1F5F9' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive ? '#E2E8F0' : '#F8FAFC',
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
                      backgroundColor: isActive ? '#0F172A' : '#94A3B8',
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
                          fontSize: '0.8125rem', // 13px Secondary Spec
                          fontWeight: isActive ? 600 : 400, // 400/600 Spec
                          color: isActive ? '#0F172A !important' : '#64748B !important',
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
