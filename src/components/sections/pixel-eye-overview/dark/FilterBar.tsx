import React, { useState, useEffect } from 'react';
import { Typography, MenuItem } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import { DashboardFilters } from '../types';
import PixelEyeDatePicker from 'components/sections/pixel-eye/PixelEyeDatePicker';
import PixelEyeField from 'components/sections/pixel-eye/PixelEyeField';

interface FilterBarProps {
  agents: string[];
  filters: DashboardFilters;
  onApplyFilters: (filters: DashboardFilters) => void;
  onReset: () => void;
}

type QuickSelectOption =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'lastWeek'
  | 'lastMonth'
  | 'allTime';
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatFilterDate = (value: string, options: Intl.DateTimeFormatOptions): string => {
  const [year, month, day] = value.split('-').map(Number);
  const localDate = new Date(year, (month || 1) - 1, day || 1);
  return localDate.toLocaleDateString('en-IN', options);
};

const FilterBar: React.FC<FilterBarProps> = ({ agents, filters, onApplyFilters, onReset }) => {
  const { mode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters);
  const [activeQuickSelect, setActiveQuickSelect] = useState<QuickSelectOption | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      setActiveQuickSelect(null);
    }
  }, [isOpen, filters]);

  const getDateRange = (option: QuickSelectOption): { dateFrom: string; dateTo: string } => {
    const today = new Date();
    const todayStr = toLocalDateString(today);

    switch (option) {
      case 'today':
        return { dateFrom: todayStr, dateTo: todayStr };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = toLocalDateString(yesterday);
        return { dateFrom: yesterdayStr, dateTo: yesterdayStr };
      }
      case 'last7': {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 6);
        return { dateFrom: toLocalDateString(last7), dateTo: todayStr };
      }
      case 'last30': {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 29);
        return { dateFrom: toLocalDateString(last30), dateTo: todayStr };
      }
      case 'lastWeek': {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        return {
          dateFrom: toLocalDateString(lastWeekStart),
          dateTo: toLocalDateString(lastWeekEnd),
        };
      }
      case 'lastMonth': {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          dateFrom: toLocalDateString(lastMonthStart),
          dateTo: toLocalDateString(lastMonthEnd),
        };
      }
      case 'allTime':
      default:
        return { dateFrom: '', dateTo: '' };
    }
  };

  const handleQuickSelect = (option: QuickSelectOption) => {
    const range = getDateRange(option);
    setLocalFilters({ ...localFilters, ...range });
    setActiveQuickSelect(option);
  };

  const handleApply = () => {
    const nextFilters = { ...localFilters };
    if (nextFilters.dateFrom && nextFilters.dateTo && nextFilters.dateFrom > nextFilters.dateTo) {
      const originalFrom = nextFilters.dateFrom;
      nextFilters.dateFrom = nextFilters.dateTo;
      nextFilters.dateTo = originalFrom;
    }

    onApplyFilters(nextFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = { dateFrom: '', dateTo: '', agent: '' };
    setLocalFilters(resetFilters);
    setActiveQuickSelect(null);
    onReset();
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!filters.dateFrom && !filters.dateTo) return 'All Time';
    if (filters.dateFrom === filters.dateTo) {
      return formatFilterDate(filters.dateFrom, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const from = filters.dateFrom
      ? formatFilterDate(filters.dateFrom, { month: 'short', day: 'numeric' })
      : 'Start';
    const to = filters.dateTo
      ? formatFilterDate(filters.dateTo, { month: 'short', day: 'numeric' })
      : 'End';
    return `${from} - ${to}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-4 px-5 py-3 rounded-2xl border transition-all duration-300 ${
          mode === 'dark'
            ? 'bg-gradient-to-tr from-[#0D1310] to-[#141C18] border-[#1E2E25] hover:border-[#22C55E]/50 shadow-[0_4px_25px_rgba(0,0,0,0.3)]'
            : 'bg-white border-gray-100 hover:border-green-500 shadow-sm hover:shadow-md'
        }`}
      >
        <div className={`p-2 rounded-xl ${mode === 'dark' ? 'bg-[#22C55E]/10' : 'bg-green-50'}`}>
          <IconifyIcon
            icon="mdi:filter-variant"
            className={mode === 'dark' ? 'text-[#22C55E]' : 'text-green-600'}
            sx={{ fontSize: 20 }}
          />
        </div>
        <div className="flex flex-col items-start min-w-[100px]">
          <span
            className={`text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-1.5 ${
              mode === 'dark' ? 'text-[#4ade80]/60' : 'text-gray-400'
            }`}
          >
            ACTIVE FILTER
          </span>
          <div
            className={`text-[13px] font-black ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {formatDateRange()}
          </div>
        </div>

        {filters.agent && (
          <div
            className={`px-3 py-1 rounded-full border text-[10px] font-black tracking-wide ${
              mode === 'dark'
                ? 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#22C55E]'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {filters.agent}
          </div>
        )}

        <div className={`ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <IconifyIcon
            icon="mdi:chevron-down"
            className={mode === 'dark' ? 'text-gray-600' : 'text-gray-400'}
            sx={{ fontSize: 18 }}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute top-full right-0 mt-3 w-[360px] z-50 rounded-3xl border shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 transform origin-top-right ${
              mode === 'dark' ? 'bg-[#0B1511]/95 border-[#1E2E25]' : 'bg-white/95 border-gray-100'
            }`}
          >
            <div className="p-5">
              <div className="mb-5">
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    mb: 2,
                    fontWeight: 900,
                    color: mode === 'dark' ? '#22C55E' : 'text.secondary',
                    letterSpacing: '0.15em',
                    fontSize: '0.65rem',
                    opacity: 0.8,
                  }}
                >
                  Quick Selection
                </Typography>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Today', value: 'today' as QuickSelectOption },
                    { label: 'Yesterday', value: 'yesterday' as QuickSelectOption },
                    { label: 'Last 7D', value: 'last7' as QuickSelectOption },
                    { label: 'Last 30D', value: 'last30' as QuickSelectOption },
                    { label: 'This Wk', value: 'lastWeek' as QuickSelectOption },
                    { label: 'This Mo', value: 'lastMonth' as QuickSelectOption },
                    { label: 'All Time', value: 'allTime' as QuickSelectOption },
                  ].map((opt) => {
                    const isActive = activeQuickSelect === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleQuickSelect(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 border ${
                          isActive
                            ? mode === 'dark'
                              ? 'bg-[#16A34A] border-[#16A34A] text-white shadow-[0_0_12px_rgba(22,163,74,0.4)]'
                              : 'bg-[#156A45] border-[#156A45] text-white'
                            : mode === 'dark'
                              ? 'bg-[#111714] border-[#1E2E25] text-[#94A3B8] hover:border-[#16A34A]/40 hover:text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    mb: 2,
                    fontWeight: 900,
                    color: mode === 'dark' ? '#22C55E' : 'text.secondary',
                    letterSpacing: '0.15em',
                    fontSize: '0.65rem',
                    opacity: 0.8,
                  }}
                >
                  Custom Period
                </Typography>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <PixelEyeDatePicker
                      fullWidth={true}
                      label="From"
                      value={localFilters.dateFrom}
                      maxDate={localFilters.dateTo || undefined}
                      onChange={(newFrom) => {
                        setLocalFilters({
                          ...localFilters,
                          dateFrom: newFrom,
                          dateTo:
                            localFilters.dateTo && newFrom > localFilters.dateTo
                              ? newFrom
                              : localFilters.dateTo,
                        });
                        setActiveQuickSelect(null);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <PixelEyeDatePicker
                      fullWidth={true}
                      label="To"
                      value={localFilters.dateTo}
                      minDate={localFilters.dateFrom || undefined}
                      disabled={!localFilters.dateFrom}
                      onChange={(newTo) => {
                        setLocalFilters({ ...localFilters, dateTo: newTo });
                        setActiveQuickSelect(null);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    mb: 2,
                    fontWeight: 900,
                    color: mode === 'dark' ? '#22C55E' : 'text.secondary',
                    letterSpacing: '0.15em',
                    fontSize: '0.65rem',
                    opacity: 0.8,
                  }}
                >
                  Assigned Agent
                </Typography>
                <PixelEyeField
                  select
                  fullWidth
                  value={localFilters.agent}
                  onChange={(e) => setLocalFilters({ ...localFilters, agent: e.target.value })}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">All Agents</MenuItem>
                  {agents.map((agent) => (
                    <MenuItem key={agent} value={agent}>
                      {agent}
                    </MenuItem>
                  ))}
                </PixelEyeField>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  onClick={handleReset}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                    mode === 'dark'
                      ? 'bg-transparent border border-[#1E2E25] text-gray-400 hover:bg-[#1E2E25] hover:text-white'
                      : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  RESET
                </button>
                <button
                  onClick={handleApply}
                  className={`flex-[1.5] py-2.5 rounded-xl text-xs font-black transition-all shadow-lg ${
                    mode === 'dark'
                      ? 'bg-[#16A34A] text-white hover:bg-[#15803d] shadow-[0_8px_20px_rgba(22,163,74,0.25)]'
                      : 'bg-[#156A45] text-white hover:bg-[#0f4d32]'
                  }`}
                >
                  APPLY FILTERS
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterBar;
