import React, { useState, useEffect } from 'react';
import { Box, Dialog, InputBase, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Patients' | 'Appointments' | 'Campaigns' | 'Leads' | 'Settings';
  icon: string;
  subtitle?: string;
  onSelect: () => void;
}

interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
  items?: CommandItem[];
}

const DEFAULT_COMMANDS: CommandItem[] = [
  { id: '1', title: 'Aarav Sharma - Eye Checkup', category: 'Patients', icon: 'solar:user-linear', subtitle: 'Phone: +91 98765 43210', onSelect: () => {} },
  { id: '2', title: 'Tomorrow 10:00 AM Appointment', category: 'Appointments', icon: 'solar:calendar-mark-linear', subtitle: 'Dr. Mehta · OPD 2', onSelect: () => {} },
  { id: '3', title: 'Diabetic Retinopathy Campaign', category: 'Campaigns', icon: 'solar:letter-linear', subtitle: 'Audience: 1,240 leads', onSelect: () => {} },
  { id: '4', title: 'High Priority IVF Enquiry', category: 'Leads', icon: 'solar:phone-calling-linear', subtitle: 'Assigned: Priya S.', onSelect: () => {} },
  { id: '5', title: 'User Management & Roles', category: 'Settings', icon: 'solar:settings-minimalistic-linear', subtitle: 'System Configuration', onSelect: () => {} },
];

export const CommandSearch: React.FC<CommandSearchProps> = ({
  open,
  onClose,
  items = DEFAULT_COMMANDS,
}) => {
  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? onClose() : undefined;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '20px', // 20px Modal Spec
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.10)', // Single Shadow Spec
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          mt: '-10vh',
        },
      }}
    >
      {/* Search Input Row (48px Height Spec) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          height: 54,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <IconifyIcon icon="solar:magnifer-linear" width={20} height={20} sx={{ color: '#64748B' }} />
        <InputBase
          autoFocus
          placeholder="Search patients, appointments, campaigns, leads..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            flex: 1,
            fontSize: '0.9375rem',
            fontFamily: '"Geist", sans-serif',
            color: '#0F172A',
          }}
        />
        <Box
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#64748B',
            backgroundColor: '#F1F5F9',
            border: '1px solid #CBD5E1',
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            fontFamily: '"Geist Mono", monospace',
          }}
        >
          ESC
        </Box>
      </Box>

      {/* Results List */}
      <Box sx={{ maxHeight: 360, overflowY: 'auto', p: 1 }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
            No results found for "{query}"
          </Box>
        ) : (
          <List disablePadding>
            {filteredItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.5,
                  mb: 0.5,
                  '&:hover': { backgroundColor: '#F1F5F9' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <IconifyIcon icon={item.icon} width={18} height={18} sx={{ color: '#2563EB' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    item.subtitle && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontFamily: '"Geist", sans-serif' }}>
                        {item.subtitle}
                      </Typography>
                    )
                  }
                />
                <Box
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#64748B',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E5E7EB',
                    px: 1,
                    py: 0.25,
                    borderRadius: '999px',
                  }}
                >
                  {item.category}
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {/* Footer shortcut tips */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748B',
          fontFamily: '"Geist", sans-serif',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
        </Box>
        <span>Invictus Global Tech CRM</span>
      </Box>
    </Dialog>
  );
};

export default CommandSearch;
