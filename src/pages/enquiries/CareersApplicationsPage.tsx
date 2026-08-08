import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Search, Eye, ExternalLink, FileText, Download, Trash2, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { RichKPICard } from 'components/ui/RichKPICard';
import {
  fetchCareersApplications,
  fetchCareersApplicationLocations,
  updateCareersApplicationStatusApi,
  exportCareersApplicationsCSVApi,
  deleteCareersApplicationApi,
} from 'services/enquiry.service';
import type { CareersApplication, CareersStatus } from 'types/enquiry';

const ensureArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [val];
    } catch (_) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export const CareersApplicationsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState<CareersApplication[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCareer, setSelectedCareer] = useState<CareersApplication | null>(null);

  // Delete Confirmation Dialog State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CareersApplication | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Metrics overview counters
  const [metrics, setMetrics] = useState({
    total: 0,
    shortlistedCount: 0,
    underReviewCount: 0,
    hiredCount: 0,
  });

  const loadLocations = useCallback(async () => {
    try {
      const res = await fetchCareersApplicationLocations();
      if (res.success && res.data) {
        setCities(res.data.cities || []);
        setStates(res.data.states || []);
      }
    } catch (err) {
      console.error('Failed to fetch careers locations', err);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchCareersApplications({
        page,
        limit: 10,
        search,
        status: statusFilter,
        role: roleFilter === 'All' ? '' : roleFilter,
        city: cityFilter,
        state: stateFilter,
        sortBy,
        sortOrder,
      });
      const rows = res.data || [];
      setData(rows);
      setTotal(res.total || 0);

      // Dynamic auto-push new cities/states to filter set
      const extractedCities: string[] = [];
      const extractedStates: string[] = [];
      rows.forEach((r) => {
        if (typeof r.current_city === 'string' && r.current_city.trim() !== '') {
          const parts = r.current_city.split(',').map((s) => s.trim()).filter(Boolean);
          if (parts.length > 0) extractedCities.push(parts[0]);
          if (parts.length > 1 && (!r.state || r.state.trim() === '')) {
            extractedStates.push(parts[1]);
          }
        }
        if (typeof r.state === 'string' && r.state.trim() !== '') {
          extractedStates.push(r.state.trim());
        }
      });
      if (extractedCities.length > 0) {
        setCities((prev) => Array.from(new Set([...prev, ...extractedCities])).sort((a, b) => a.localeCompare(b)));
      }
      if (extractedStates.length > 0) {
        setStates((prev) => Array.from(new Set([...prev, ...extractedStates])).sort((a, b) => a.localeCompare(b)));
      }

      // Compute overview metrics from total dataset
      const allRes = await fetchCareersApplications({ page: 1, limit: 100 });
      const allRows = allRes.data || [];
      setMetrics({
        total: allRes.total || 0,
        shortlistedCount: allRows.filter((r) => r.status === 'Shortlisted').length,
        underReviewCount: allRows.filter((r) => r.status === 'Under Review' || r.status === 'New').length,
        hiredCount: allRows.filter((r) => r.status === 'Hired').length,
      });
    } catch (err) {
      console.error('Failed to load careers applications', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page, search, statusFilter, roleFilter, cityFilter, stateFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSortToggle = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleStatusChange = async (id: string, newStatus: CareersStatus) => {
    try {
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await updateCareersApplicationStatusApi(id, newStatus);
      loadData(false);
    } catch (err) {
      console.error('Failed to update status', err);
      loadData(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem) return;
    setDeleting(true);
    try {
      await deleteCareersApplicationApi(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete application', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await exportCareersApplicationsCSVApi({
        search,
        status: statusFilter,
        role: roleFilter === 'All' ? '' : roleFilter,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careers_applications_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const getStatusStyle = (status: CareersStatus) => {
    switch (status) {
      case 'New':
        return {
          bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
          color: isDark ? '#60A5FA' : '#2563EB',
          border: isDark ? 'rgba(96, 165, 250, 0.4)' : '#BFDBFE',
        };
      case 'Shortlisted':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
          color: isDark ? '#34D399' : '#059669',
          border: isDark ? 'rgba(52, 211, 153, 0.4)' : '#A7F3D0',
        };
      case 'Under Review':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB',
          color: isDark ? '#FBBF24' : '#D97706',
          border: isDark ? 'rgba(251, 191, 36, 0.4)' : '#FDE68A',
        };
      case 'Rejected':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
          color: isDark ? '#F87171' : '#DC2626',
          border: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FCA5A5',
        };
      case 'Hired':
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#F0FDF4',
          color: isDark ? '#4ADE80' : '#16A34A',
          border: isDark ? 'rgba(74, 222, 128, 0.4)' : '#86EFAC',
        };
      default:
        return {
          bg: isDark ? 'rgba(148, 163, 184, 0.2)' : '#F1F5F9',
          color: isDark ? '#CBD5E1' : '#475569',
          border: isDark ? 'rgba(203, 213, 225, 0.4)' : '#CBD5E1',
        };
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Title */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Invictus Careers Applications Overview
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mt: 0.5 }}>
          Manage Invictus candidate job applications, screening flags, and role-filtered candidate workflows.
        </Typography>
      </Box>

      {/* Overview Metrics Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2.5 }}>
        <RichKPICard
          title="Total Applications"
          value={metrics.total}
          icon="hugeicons:briefcase-01"
          color="primary"
          comparisonText="All role applicants"
        />
        <RichKPICard
          title="Shortlisted"
          value={metrics.shortlistedCount}
          icon="hugeicons:user-check"
          color="success"
          comparisonText="Passed initial review"
        />
        <RichKPICard
          title="Under Review"
          value={metrics.underReviewCount}
          icon="hugeicons:clock-01"
          color="warning"
          comparisonText="New & pending review"
        />
        <RichKPICard
          title="Hired Candidates"
          value={metrics.hiredCount}
          icon="hugeicons:award-01"
          color="info"
          comparisonText="Successfully hired"
        />
      </Box>

      {/* Main Table Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
          boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Filters Toolbar */}
        {/* Filters Toolbar */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          }}
        >
          {/* Top Row: Role Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: isDark ? '#94A3B8' : '#64748B' }}>
              Role:
            </Typography>
            {['All', 'Graphic Designer', 'Video Editor', 'HR & Operations Executive', 'HR & Operations Intern', 'Telecalling Executive'].map((roleItem) => {
              const isSelected = roleFilter === roleItem;
              return (
                <Chip
                  key={roleItem}
                  label={roleItem}
                  onClick={() => {
                    setRoleFilter(roleItem);
                    setPage(1);
                  }}
                  sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    bgcolor: isSelected
                      ? '#2563EB'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : '#FFFFFF',
                    color: isSelected
                      ? '#FFFFFF'
                      : isDark
                        ? '#CBD5E1'
                        : '#475569',
                    border: '1px solid',
                    borderColor: isSelected
                      ? '#2563EB'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.15)'
                        : '#CBD5E1',
                    '&:hover': {
                      bgcolor: isSelected
                        ? '#1D4ED8'
                        : isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : '#F1F5F9',
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Bottom Row: Search & Filters Dropdowns + Export Button */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TextField
              size="small"
              placeholder="Search by reference IGT-XXXXXX, applicant, email, city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <Search style={{ width: 18, height: 18, marginRight: 8, color: '#94A3B8' }} />,
              }}
              sx={{
                width: 360,
                maxWidth: '100%',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                borderRadius: 1.5,
                '& .MuiInputBase-input': {
                  color: isDark ? '#F8FAFC' : '#0F172A',
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}>
                  Role:
                </Typography>
                <Select
                  size="small"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    minWidth: 200,
                    borderRadius: 1.5,
                    '.MuiSvgIcon-root': { color: isDark ? '#94A3B8' : '#475569' },
                  }}
                >
                  <MenuItem value="All">All Roles</MenuItem>
                  <MenuItem value="Graphic Designer">Graphic Designer</MenuItem>
                  <MenuItem value="Video Editor">Video Editor</MenuItem>
                  <MenuItem value="HR & Operations Executive">HR & Operations Executive</MenuItem>
                  <MenuItem value="HR & Operations Intern">HR & Operations Intern</MenuItem>
                  <MenuItem value="Telecalling Executive">Telecalling Executive</MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}>
                  City:
                </Typography>
                <Select
                  size="small"
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    minWidth: 140,
                    borderRadius: 1.5,
                    '.MuiSvgIcon-root': { color: isDark ? '#94A3B8' : '#475569' },
                  }}
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {cities.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}>
                  State:
                </Typography>
                <Select
                  size="small"
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    minWidth: 140,
                    borderRadius: 1.5,
                    '.MuiSvgIcon-root': { color: isDark ? '#94A3B8' : '#475569' },
                  }}
                >
                  <MenuItem value="">All States</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}>
                  Status:
                </Typography>
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    minWidth: 150,
                    borderRadius: 1.5,
                    '.MuiSvgIcon-root': { color: isDark ? '#94A3B8' : '#475569' },
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Hired">Hired</MenuItem>
                </Select>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Download style={{ width: 16, height: 16 }} />}
                onClick={handleExportCSV}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
                  color: isDark ? '#F8FAFC' : '#334155',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#94A3B8',
                  },
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Data Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, bgcolor: 'transparent' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Ref ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Role</TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('full_name')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Applicant Name
                      {sortBy === 'full_name' ? (
                        sortOrder === 'ASC' ? <ArrowUp style={{ width: 14, height: 14, color: '#2563EB' }} /> : <ArrowDown style={{ width: 14, height: 14, color: '#2563EB' }} />
                      ) : (
                        <ArrowUpDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('current_city')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      City / State
                      {sortBy === 'current_city' ? (
                        sortOrder === 'ASC' ? <ArrowUp style={{ width: 14, height: 14, color: '#2563EB' }} /> : <ArrowDown style={{ width: 14, height: 14, color: '#2563EB' }} />
                      ) : (
                        <ArrowUpDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Experience</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Portfolio / Links</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Screening Flags</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: isDark ? '#64748B' : '#94A3B8' }}>
                      No career application records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => {
                    const stStyle = getStatusStyle(row.status);
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.03) !important' : 'rgba(0, 0, 0, 0.02) !important',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: isDark ? '#60A5FA' : '#2563EB', fontFamily: 'monospace' }}>
                          {row.application_reference}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>{row.role}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            {row.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block' }}>
                            {row.email} • {row.phone}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                          {row.current_city}{row.state ? `, ${row.state}` : ''}
                        </TableCell>
                        <TableCell sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                          {row.experience.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {row.portfolio_or_showreel && (
                              <Tooltip title="Open Portfolio/Showreel">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={row.portfolio_or_showreel}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink style={{ width: 16, height: 16, color: isDark ? '#60A5FA' : '#2563EB' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {row.resume_or_linkedin && (
                              <Tooltip title="Open Resume/LinkedIn">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={row.resume_or_linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <FileText style={{ width: 16, height: 16, color: isDark ? '#34D399' : '#059669' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(() => {
                              const flags = ensureArray(row.screening_flags);
                              return flags.length > 0 ? (
                                flags.map((flag) => (
                                  <Chip
                                    key={flag}
                                    label={flag}
                                    size="small"
                                    sx={{
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                                      color: isDark ? '#F87171' : '#DC2626',
                                      border: '1px solid',
                                      borderColor: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FCA5A5',
                                    }}
                                  />
                                ))
                              ) : (
                                <Chip
                                  label="Clean"
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    bgcolor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#F0FDF4',
                                    color: isDark ? '#4ADE80' : '#16A34A',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(74, 222, 128, 0.4)' : '#86EFAC',
                                  }}
                                />
                              );
                            })()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={row.status}
                            onChange={(e) => handleStatusChange(row.id, e.target.value as CareersStatus)}
                            sx={{
                              height: 32,
                              minWidth: 130,
                              borderRadius: '16px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              bgcolor: stStyle.bg,
                              color: stStyle.color,
                              '.MuiOutlinedInput-notchedOutline': {
                                borderColor: stStyle.border,
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: stStyle.color,
                              },
                              '.MuiSvgIcon-root': {
                                color: `${stStyle.color} !important`,
                                right: 6,
                              },
                              '& .MuiSelect-select': {
                                py: '4px !important',
                                pl: '12px !important',
                                pr: '28px !important',
                                display: 'flex',
                                alignItems: 'center',
                              },
                            }}
                          >
                            <MenuItem value="New">New</MenuItem>
                            <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="Under Review">Under Review</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Hired">Hired</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="View Application Details">
                              <IconButton size="small" onClick={() => setSelectedCareer(row)}>
                                <Eye style={{ width: 18, height: 18, color: isDark ? '#94A3B8' : '#475569' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Application">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteConfirmItem(row)}
                                sx={{
                                  color: isDark ? '#F87171' : '#DC2626',
                                  '&:hover': { bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' },
                                }}
                              >
                                <Trash2 style={{ width: 18, height: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justify: 'flex-end',
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          }}
        >
          <Pagination
            count={Math.ceil(total / 10)}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      </Card>

      {/* Candidate Detail Dialog */}
      {selectedCareer && (
        <Dialog
          open={!!selectedCareer}
          onClose={() => setSelectedCareer(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#F8FAFC' : '#0F172A',
              backgroundImage: 'none',
              borderRadius: 3,
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : undefined,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              pb: 1.5,
              color: isDark ? '#F8FAFC' : '#0F172A',
              borderBottom: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
            }}
          >
            Candidate Application Detail - {selectedCareer.application_reference}
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {selectedCareer.full_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Role Applied
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: isDark ? '#60A5FA' : '#2563EB' }}>
                  {selectedCareer.role}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Email & Phone
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                  {selectedCareer.email} • {selectedCareer.phone}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  City & Notice Period
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                  {selectedCareer.current_city} (Notice: {selectedCareer.notice_period})
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Portfolio / Showreel
                </Typography>
                <Typography variant="body2">
                  {selectedCareer.portfolio_or_showreel ? (
                    <a href={selectedCareer.portfolio_or_showreel} target="_blank" rel="noreferrer" style={{ color: isDark ? '#60A5FA' : '#2563EB', fontWeight: 600 }}>
                      Open Portfolio Link ↗
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Resume / LinkedIn
                </Typography>
                <Typography variant="body2">
                  {selectedCareer.resume_or_linkedin ? (
                    <a href={selectedCareer.resume_or_linkedin} target="_blank" rel="noreferrer" style={{ color: isDark ? '#34D399' : '#059669', fontWeight: 600 }}>
                      Open Resume Link ↗
                    </a>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Tools Proficient In
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {ensureArray(selectedCareer.tools).map((tool) => (
                  <Chip
                    key={tool}
                    label={tool}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: isDark ? '#F8FAFC' : undefined,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : undefined,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : undefined,
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Work Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {ensureArray(selectedCareer.work_categories).map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{
                      color: isDark ? '#60A5FA' : undefined,
                      borderColor: isDark ? 'rgba(96, 165, 250, 0.4)' : undefined,
                      bgcolor: isDark ? 'rgba(96, 165, 250, 0.1)' : undefined,
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Workflow Answer
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  mt: 0.5,
                }}
              >
                {selectedCareer.workflow_answer}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Judgement Answer
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  mt: 0.5,
                }}
              >
                {selectedCareer.judgement_answer}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  AI Usage
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {selectedCareer.ai_usage}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Practical Assessment Ready
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {selectedCareer.practical_assessment}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }}>
            <Button
              onClick={() => setSelectedCareer(null)}
              variant="contained"
              sx={{
                bgcolor: isDark ? '#2AB182' : '#0F172A',
                color: isDark ? '#000000' : '#FFFFFF',
                fontWeight: 700,
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: isDark ? '#22956d' : '#1E293B',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog Popup */}
      {deleteConfirmItem && (
        <Dialog
          open={!!deleteConfirmItem}
          onClose={() => setDeleteConfirmItem(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#F8FAFC' : '#0F172A',
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: isDark ? '#F87171' : '#DC2626' }}>
            <AlertTriangle style={{ width: 24, height: 24 }} /> Confirm Candidate Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#475569' }}>
              Are you sure you want to delete application <strong>{deleteConfirmItem.application_reference}</strong> ({deleteConfirmItem.full_name})?
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: isDark ? '#94A3B8' : '#64748B' }}>
              This action is permanent and cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setDeleteConfirmItem(null)}
              disabled={deleting}
              sx={{ textTransform: 'none', fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Trash2 style={{ width: 16, height: 16 }} />}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
            >
              {deleting ? 'Deleting...' : 'Delete Application'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CareersApplicationsPage;
