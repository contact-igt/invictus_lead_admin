// src/components/ActionMenu.tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

interface Action {
  id: number;
  icon: string;
  title: 'Edit' | 'View' | 'Remove';
}

const actions: Action[] = [
  { id: 1, icon: 'hugeicons:pencil-edit-02', title: 'Edit' },
  { id: 2, icon: 'hugeicons:view', title: 'View' },
  { id: 3, icon: 'hugeicons:delete-02', title: 'Remove' },
];

interface ActionMenuProps {
  onRemove?: () => void;
  onView?: () => void;
  onEdit?: () => void;
}

const ActionMenu = ({ onRemove, onView, onEdit }: ActionMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleOpen(e);
        }}
      >
        <IconifyIcon icon="iconamoon:menu-kebab-horizontal-fill" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {actions.map((a) => {
          const isRemove = a.title === 'Remove';

          // Only show action if the handler is provided
          if (a.title === 'Edit' && !onEdit) return null;
          if (a.title === 'Remove' && !onRemove) return null;
          if (a.title === 'View' && !onView) return null;
          return (
            <MenuItem
              key={a.id}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
                switch (a.title) {
                  case 'Edit':
                    onEdit?.();
                    break;
                  case 'Remove':
                    onRemove?.();
                    break;
                  case 'View':
                    onView?.();
                }
              }}
            >
              <ListItemIcon sx={{ color: isRemove ? 'error.main' : 'inherit' }}>
                <IconifyIcon icon={a.icon} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color={isRemove ? 'error.main' : 'text.primary'}>
                    {a.title}
                  </Typography>
                }
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default ActionMenu;
