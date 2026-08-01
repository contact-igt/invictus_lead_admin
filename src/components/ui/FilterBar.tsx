import React from 'react';
import { Box, InputBase, MenuItem, Select } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Button from './Button';
import { EnterpriseStatus } from './StatusChip';

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusValue?: string;
  onStatusChange?: (status: string) => void;
  dateFrom?: string;
  onDateFromChange?: (date: string) => void;
  dateTo?: string;
  onDateToChange?: (date: string) => void;
  onReset?: () => void;
}

const ALLOWED_STATUSES: EnterpriseStatus[] = [
  'Healthy',
  'Running',
  'Pending',
  'Completed',
  'Draft',
  'Critical',
  'Needs Review',
  'Cancelled',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue = '',
  onSearchChange,
  statusValue = '',
  onStatusChange,
  dateFrom = '',
  onDateFromChange,
  dateTo = '',
  onDateToChange,
  onReset,
}) => {
  return (
    <Box
      sx={{
        borderRadius: '18px', // 18px Card Spec
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)', // Single Shadow Spec
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {/* Search Input (48px Height Spec) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.75,
          height: 44,
          borderRadius: '12px', // 12px Input Spec
          backgroundColor: '#F8FAFC',
          border: '1px solid #E5E7EB',
          flex: 1,
          minWidth: 220,
        }}
      >
        <IconifyIcon icon="solar:magnifer-linear" width={18} height={18} sx={{ color: '#64748B' }} />
        <InputBase
          placeholder="Filter leads, patients, status..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          sx={{
            fontSize: '0.875rem',
            fontFamily: '"Geist", sans-serif',
            color: '#0F172A',
            width: '100%',
          }}
        />
      </Box>

      {/* Status Dropdown Filter */}
      <Select
        displayEmpty
        value={statusValue}
        onChange={(e) => onStatusChange?.(e.target.value)}
        sx={{
          height: 44,
          borderRadius: '12px',
          backgroundColor: '#F8FAFC',
          fontSize: '0.875rem',
          fontFamily: '"Geist", sans-serif',
          color: '#0F172A',
          minWidth: 150,
          '& fieldset': { borderColor: '#E5E7EB' },
        }}
      >
        <MenuItem value="">All Statuses</MenuItem>
        {ALLOWED_STATUSES.map((st) => (
          <MenuItem key={st} value={st}>
            {st}
          </MenuItem>
        ))}
      </Select>

      {/* Date From */}
      <Box
        component="input"
        type="date"
        value={dateFrom}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDateFromChange?.(e.target.value)}
        sx={{
          height: 44,
          borderRadius: '12px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E5E7EB',
          px: 1.5,
          fontSize: '0.875rem',
          fontFamily: '"Geist", sans-serif',
          color: '#0F172A',
          outline: 'none',
        }}
      />

      {/* Date To */}
      <Box
        component="input"
        type="date"
        value={dateTo}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDateToChange?.(e.target.value)}
        sx={{
          height: 44,
          borderRadius: '12px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E5E7EB',
          px: 1.5,
          fontSize: '0.875rem',
          fontFamily: '"Geist", sans-serif',
          color: '#0F172A',
          outline: 'none',
        }}
      />

      {/* Reset Action */}
      {onReset && (
        <Button variant="ghost" onClick={onReset} sx={{ height: 44, px: 2 }}>
          Reset
        </Button>
      )}
    </Box>
  );
};

export default FilterBar;
