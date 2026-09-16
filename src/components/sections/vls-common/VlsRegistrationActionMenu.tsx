import { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface VlsRegistrationActionMenuProps<T> {
  registration: T;
  onView: (registration: T) => void;
  onEdit: (registration: T) => void;
  onDelete: (registration: T) => void;
}

const VlsRegistrationActionMenu = <T,>({
  registration,
  onView,
  onEdit,
  onDelete,
}: VlsRegistrationActionMenuProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const runAction = (event: React.MouseEvent, action: (registration: T) => void) => {
    event.stopPropagation();
    setAnchorEl(null);
    action(registration);
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={openMenu} aria-label="Open registration actions">
          <IconifyIcon icon="mdi:dots-vertical" width={20} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => closeMenu()}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 150 } } }}
      >
        <MenuItem onClick={(event) => runAction(event, onView)}>
          <ListItemIcon>
            <IconifyIcon icon="mdi:eye-outline" width={19} />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={(event) => runAction(event, onEdit)}>
          <ListItemIcon>
            <IconifyIcon icon="mdi:pencil-outline" width={19} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={(event) => runAction(event, onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <IconifyIcon icon="mdi:trash-can-outline" width={19} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default VlsRegistrationActionMenu;
