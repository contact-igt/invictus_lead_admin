import React, { useState, useEffect } from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import { DashboardFilters } from '../types';

interface FilterBarProps {
  agents: string[];
  filters: DashboardFilters;
  onApplyFilters: (filters: DashboardFilters) => void;
  onReset: () => void;
}

type QuickSelectOption = 'today' | 'yesterday' | 'last7' | 'last30' | 'lastWeek' | 'lastMonth' | 'allTime';

const FilterBar: React.FC<FilterBarProps> = ({ agents, filters, onApplyFilters, onReset }) => {
  const { mode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [activeQuickSelect, setActiveQuickSelect] = useState<QuickSelectOption | null>(null);

  // Sync localFilters with incoming filters prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      setActiveQuickSelect(null);
    }
  }, [isOpen, filters]);

  const getDateRange = (option: QuickSelectOption): { dateFrom: string; dateTo: string } => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (option) {
      case 'today':
        return { dateFrom: todayStr, dateTo: todayStr };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        return { dateFrom: yesterdayStr, dateTo: yesterdayStr };
      }
      case 'last7': {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 6);
        return { dateFrom: last7.toISOString().split('T')[0], dateTo: todayStr };
      }
      case 'last30': {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 29);
        return { dateFrom: last30.toISOString().split('T')[0], dateTo: todayStr };
      }
      case 'lastWeek': {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        return { dateFrom: lastWeekStart.toISOString().split('T')[0], dateTo: lastWeekEnd.toISOString().split('T')[0] };
      }
      case 'lastMonth': {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { dateFrom: lastMonthStart.toISOString().split('T')[0], dateTo: lastMonthEnd.toISOString().split('T')[0] };
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
    setShowCustomRange(false);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
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
      return new Date(filters.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const from = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Start';
    const to = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'End';
    return `${from} - ${to}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          mode === 'dark'
            ? 'bg-gradient-to-br from-[#111714] to-[#0D1310] border-[#1E2E25] hover:border-[#16A34A]/50 shadow-lg hover:shadow-[0_4px_20px_rgba(34,197,94,0.15)]'
            : 'bg-white border-gray-200 hover:border-green-500 shadow-sm hover:shadow-md'
        }`}
      >
        <IconifyIcon icon="mdi:filter-variant" className={mode === 'dark' ? 'text-[#22C55E]' : 'text-green-600'} sx={{ fontSize: 20 }} />
        <div className="flex flex-col items-start">
          <div className={`text-xs font-semibold uppercase tracking-wide ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}>Filter</div>
          <div className={`text-sm font-bold ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{formatDateRange()}</div>
        </div>
        {filters.agent && (
          <div className={`px-2 py-0.5 rounded border ${
            mode === 'dark'
              ? 'bg-[#16A34A]/20 border-[#16A34A]/30'
              : 'bg-green-100 border-green-300'
          }`}>
            <span className={`text-xs font-semibold ${
              mode === 'dark' ? 'text-[#22C55E]' : 'text-green-700'
            }`}>{filters.agent}</span>
          </div>
        )}
        <IconifyIcon icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} className={mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'} sx={{ fontSize: 20 }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute top-full right-0 mt-2 w-[680px] z-50 rounded-2xl border shadow-2xl overflow-hidden ${
            mode === 'dark'
              ? 'bg-[#0A0F0D] border-[#1E2E25]'
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              {/* Quick Select */}
              <div className="mb-6">
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                  mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
                }`}>QUICK SELECT</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Today', value: 'today' as QuickSelectOption },
                    { label: 'Yesterday', value: 'yesterday' as QuickSelectOption },
                    { label: 'Last 7 Days', value: 'last7' as QuickSelectOption },
                    { label: 'Last 30 Days', value: 'last30' as QuickSelectOption },
                    { label: 'Last Week', value: 'lastWeek' as QuickSelectOption },
                    { label: 'Last Month', value: 'lastMonth' as QuickSelectOption },
                    { label: '• All Time', value: 'allTime' as QuickSelectOption, special: true },
                  ].map((opt) => {
                    const isActive = activeQuickSelect === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleQuickSelect(opt.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                          isActive
                            ? (mode === 'dark' 
                                ? 'bg-[#16A34A] text-white border-[#22C55E] shadow-lg shadow-[#16A34A]/50'
                                : 'bg-green-600 text-white border-green-700 shadow-md')
                            : opt.special
                            ? (mode === 'dark'
                                ? 'bg-[#16A34A]/10 text-[#22C55E] hover:bg-[#16A34A]/20 border-[#16A34A]/30'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200')
                            : (mode === 'dark'
                                ? 'bg-[#111714] text-[#DFFFE3] hover:bg-[#1E2E25] border-[#0F1B16]'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200')
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                
                {/* Preview of selected range */}
                {(localFilters.dateFrom || localFilters.dateTo) && (
                  <div className={`mt-3 p-2 rounded-lg border ${
                    mode === 'dark'
                      ? 'bg-[#052E16] border-[#16A34A]/30'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`text-xs ${
                      mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
                    }`}>Selected Range:</div>
                    <div className={`text-sm font-semibold mt-0.5 ${
                      mode === 'dark' ? 'text-[#22C55E]' : 'text-green-700'
                    }`}>
                      {!localFilters.dateFrom && !localFilters.dateTo 
                        ? 'All Time' 
                        : localFilters.dateFrom === localFilters.dateTo
                        ? new Date(localFilters.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : `${localFilters.dateFrom ? new Date(localFilters.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Start'} - ${localFilters.dateTo ? new Date(localFilters.dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'End'}`
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`text-xs font-bold uppercase tracking-wider ${
                    mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
                  }`}>CUSTOM RANGE</div>
                  <button
                    onClick={() => setShowCustomRange(!showCustomRange)}
                    className={`text-xs font-semibold transition-colors ${
                      mode === 'dark'
                        ? 'text-[#22C55E] hover:text-[#16A34A]'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {showCustomRange ? 'Hide' : 'Show'} Calendar
                  </button>
                </div>
                {showCustomRange && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${
                        mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
                      }`}>Start Date</label>
                      <input
                        type="date"
                        value={localFilters.dateFrom}
                        onChange={(e) => {
                          setLocalFilters({ ...localFilters, dateFrom: e.target.value });
                          setActiveQuickSelect(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors ${
                          mode === 'dark'
                            ? 'bg-[#111714] border-[#1E2E25] text-white focus:border-[#16A34A]'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }`}
                        style={{ colorScheme: mode }}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${
                        mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
                      }`}>End Date</label>
                      <input
                        type="date"
                        value={localFilters.dateTo}
                        onChange={(e) => {
                          setLocalFilters({ ...localFilters, dateTo: e.target.value });
                          setActiveQuickSelect(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-colors ${
                          mode === 'dark'
                            ? 'bg-[#111714] border-[#1E2E25] text-white focus:border-[#16A34A]'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }`}
                        style={{ colorScheme: mode }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Filter */}
              <div className="mb-6">
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                  mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
                }`}>AGENT</div>
                <select
                  value={localFilters.agent}
                  onChange={(e) => setLocalFilters({ ...localFilters, agent: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-colors ${
                    mode === 'dark'
                      ? 'bg-[#111714] border-[#1E2E25] text-white focus:border-[#16A34A]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                  }`}
                >
                  <option value="">All Agents</option>
                  {agents.map((agent) => (
                    <option key={agent} value={agent}>
                      {agent}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-between pt-4 border-t ${
                mode === 'dark' ? 'border-[#1E2E25]' : 'border-gray-200'
              }`}>
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    mode === 'dark'
                      ? 'text-[#94A3B8] hover:text-white hover:bg-[#111714]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  RESET
                </button>
                <button
                  onClick={handleApply}
                  className={`px-6 py-2 rounded-lg text-sm font-bold text-white transition-all duration-200 shadow-lg ${
                    mode === 'dark'
                      ? 'bg-[#16A34A] hover:bg-[#22C55E] hover:shadow-[0_4px_20px_rgba(34,197,94,0.3)]'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
                  }`}
                >
                  APPLY
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
