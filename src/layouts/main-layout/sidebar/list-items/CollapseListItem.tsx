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
          mb: 0.25,
          borderRadius: 2,
          px: 1.25,
          py: 0.875,
          backgroundColor: isAnyChildActive ? '#1F6B40' : 'transparent',
          borderLeft: isAnyChildActive ? '3px solid #3DAA6B' : '3px solid transparent',
          '&:hover': {
            backgroundColor: isAnyChildActive
              ? '#1F6B40'
              : 'rgba(255,255,255,0.06)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {icon && (
            <IconifyIcon
              icon={icon}
              width={18}
              height={18}
              sx={{ color: isAnyChildActive ? '#7ECBA5' : 'rgba(255,255,255,0.45)' }}
            />
          )}
        </ListItemIcon>
        <ListItemText
          primary={subheader}
          primaryTypographyProps={{
            sx: {
              fontSize: '0.8125rem',
              fontWeight: isAnyChildActive ? 600 : 500,
              color: isAnyChildActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
              letterSpacing: '0.01em',
            },
          }}
        />
        <IconifyIcon
          icon="iconamoon:arrow-down-2-duotone"
          width={14}
          sx={{
            color: isAnyChildActive ? '#7ECBA5' : 'rgba(255,255,255,0.3)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </ListItemButton>

      {/* ── Sub-items ─────────────────────────────────────────────── */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 1.5, mb: 0.5 }}>
          {/* Left accent line */}
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 14,
                top: 4,
                bottom: 4,
                width: '1px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 1,
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
                    pl: 3.25,
                    py: 0.625,
                    mb: 0.125,
                    borderRadius: 1.5,
                    backgroundColor: isActive ? 'rgba(46,139,87,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'rgba(46,139,87,0.25)'
                        : 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  {/* Dot indicator */}
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#3DAA6B' : 'rgba(255,255,255,0.2)',
                      mr: 1.25,
                      flexShrink: 0,
                      transition: 'background-color 0.15s ease',
                    }}
                  />
                  <ListItemText
                    primary={route.name}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.01em',
                        transition: 'color 0.15s ease',
                      },
                    }}
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
