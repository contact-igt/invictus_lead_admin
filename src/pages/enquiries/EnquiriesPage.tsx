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
  Tabs,
  Tab,
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
import {
  Search,
  Eye,
  ExternalLink,
  Briefcase,
  FileText,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  fetchGeneralEnquiries,
  updateGeneralEnquiryStatusApi,
  deleteGeneralEnquiryApi,
  fetchCareersApplications,
  fetchCareersApplicationFilters,
  updateCareersApplicationStatusApi,
  deleteCareersApplicationApi,
} from 'services/enquiry.service';
import LocationFilter from 'components/common/LocationFilter';
import type {
  GeneralEnquiry,
  CareersApplication,
  GeneralEnquiryStatus,
  CareersStatus,
} from 'types/enquiry';

// Known roles that should always be offered even before any application exists for them.
const BASE_CAREERS_ROLES = [
  'Graphic Designer',
  'Video Editor',
  'HR & Operations Executive',
  'HR & Operations Intern',
  'Telecalling Executive',
];

const mergeSorted = (prev: string[], incoming: string[]): string[] =>
  Array.from(new Set([...prev, ...incoming.filter((v) => typeof v === 'string' && v.trim() !== '')]))
    .sort((a, b) => a.localeCompare(b));

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

export const EnquiriesPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState<'general' | 'careers'>('general');

  // General Enquiries State
  const [generalData, setGeneralData] = useState<GeneralEnquiry[]>([]);
  const [generalTotal, setGeneralTotal] = useState<number>(0);
  const [generalPage, setGeneralPage] = useState<number>(1);
  const [generalStatusFilter, setGeneralStatusFilter] = useState<string>('');
  const [generalSortBy, setGeneralSortBy] = useState<string>('submitted_at');
  const [generalSortOrder, setGeneralSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Careers Applications State
  const [careersData, setCareersData] = useState<CareersApplication[]>([]);
  const [careersTotal, setCareersTotal] = useState<number>(0);
  const [careersPage, setCareersPage] = useState<number>(1);
  const [careersStatusFilter, setCareersStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [careersCityFilter, setCareersCityFilter] = useState<string>('');
  const [careersStateFilter, setCareersStateFilter] = useState<string>('');
  const [careersSortBy, setCareersSortBy] = useState<string>('createdAt');
  const [careersSortOrder, setCareersSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [careersRoles, setCareersRoles] = useState<string[]>([...BASE_CAREERS_ROLES]);

  // Common Search & Loading State
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCareer, setSelectedCareer] = useState<CareersApplication | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<GeneralEnquiry | null>(null);

  // Delete State
  const [deleteGeneralConfirm, setDeleteGeneralConfirm] = useState<GeneralEnquiry | null>(null);
  const [deleteCareersConfirm, setDeleteCareersConfirm] = useState<CareersApplication | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Role options come from the dedicated filters endpoint (single source of truth).
  const loadCareersFilterMeta = useCallback(async () => {
    try {
      const res = await fetchCareersApplicationFilters();
      if (res.success && res.data) {
        setCareersRoles((prev) => mergeSorted(prev, res.data.roles.map((r) => r.name)));
      }
    } catch (err) {
      console.error('Failed to fetch careers filter metadata', err);
    }
  }, []);

  useEffect(() => {
    loadCareersFilterMeta();
  }, [loadCareersFilterMeta]);

  // Passed to <LocationFilter>; re-scopes the city list to the chosen state.
  const fetchCareersLocationOptions = useCallback(async ({ state }: { state?: string }) => {
    const res = await fetchCareersApplicationFilters(state ? { state } : {});
    return { states: res.data.states, cities: res.data.cities };
  }, []);

  // Load General Enquiries
  const loadGeneralEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGeneralEnquiries({
        page: generalPage,
        limit: 10,
        search,
        status: generalStatusFilter,
        sortBy: generalSortBy,
        sortOrder: generalSortOrder,
      });
      const rows = res.data || [];
      setGeneralData(rows);
      setGeneralTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load general enquiries', err);
    } finally {
      setLoading(false);
    }
  }, [generalPage, search, generalStatusFilter, generalSortBy, generalSortOrder]);

  // Load Careers Applications
  const loadCareersApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCareersApplications({
        page: careersPage,
        limit: 10,
        search,
        status: careersStatusFilter,
        role: roleFilter === 'All' ? '' : roleFilter,
        city: careersCityFilter,
        state: careersStateFilter,
        sortBy: careersSortBy,
        sortOrder: careersSortOrder,
      });
      const rows = res.data || [];
      setCareersData(rows);
      setCareersTotal(res.total || 0);

    } catch (err) {
      console.error('Failed to load careers applications', err);
    } finally {
      setLoading(false);
    }
  }, [careersPage, search, careersStatusFilter, roleFilter, careersCityFilter, careersStateFilter, careersSortBy, careersSortOrder]);

  useEffect(() => {
    if (activeTab === 'general') {
      loadGeneralEnquiries();
    } else {
      loadCareersApplications();
    }
  }, [activeTab, loadGeneralEnquiries, loadCareersApplications]);

  const handleGeneralSortToggle = (column: string) => {
    if (generalSortBy === column) {
      setGeneralSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setGeneralSortBy(column);
      setGeneralSortOrder('ASC');
    }
    setGeneralPage(1);
  };

  const handleCareersSortToggle = (column: string) => {
    if (careersSortBy === column) {
      setCareersSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setCareersSortBy(column);
      setCareersSortOrder('ASC');
    }
    setCareersPage(1);
  };

  // Handle Status Update for General Enquiry
  const handleGeneralStatusChange = async (id: string, newStatus: GeneralEnquiryStatus) => {
    try {
      setGeneralData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await updateGeneralEnquiryStatusApi(id, newStatus);
    } catch (err) {
      console.error('Failed to update general enquiry status', err);
    }
  };

  // Handle Status Update for Careers Application
  const handleCareersStatusChange = async (id: string, newStatus: CareersStatus) => {
    try {
      setCareersData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await updateCareersApplicationStatusApi(id, newStatus);
    } catch (err) {
      console.error('Failed to update careers application status', err);
    }
  };

  // Handle Delete General Enquiry
  const handleDeleteGeneralConfirm = async () => {
    if (!deleteGeneralConfirm) return;
    setDeleting(true);
    try {
      await deleteGeneralEnquiryApi(deleteGeneralConfirm.id);
      setDeleteGeneralConfirm(null);
      await loadGeneralEnquiries();
    } catch (err) {
      console.error('Failed to delete general enquiry', err);
    } finally {
      setDeleting(false);
    }
  };

  // Handle Delete Careers Application
  const handleDeleteCareersConfirm = async () => {
    if (!deleteCareersConfirm) return;
    setDeleting(true);
    try {
      await deleteCareersApplicationApi(deleteCareersConfirm.id);
      setDeleteCareersConfirm(null);
      await loadCareersApplications();
    } catch (err) {
      console.error('Failed to delete careers application', err);
    } finally {
      setDeleting(false);
    }
  };


  const getGeneralStatusColor = (status: GeneralEnquiryStatus) => {
    switch (status) {
      case 'New':
        return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'Contacted':
        return { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
      case 'In Progress':
        return { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF' };
      case 'Closed':
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    }
  };

  const getCareersStatusColor = (status: CareersStatus) => {
    switch (status) {
      case 'New':
        return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'Shortlisted':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'Under Review':
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      case 'Rejected':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' };
      case 'Hired':
        return { bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>
            Website Enquiries & Careers Applications
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Real-time dual-table submission management for website leads and job candidate workflows.
          </Typography>
        </Box>
      </Box>

      {/* Tabs Selection */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setSearch('');
          }}
          sx={{
            px: 2,
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            },
          }}
        >
          <Tab
            label="General Enquiries"
            value="general"
            icon={<FileText style={{ width: 18, height: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="Careers Applications"
            value="careers"
            icon={<Briefcase style={{ width: 18, height: 18 }} />}
            iconPosition="start"
          />
        </Tabs>

        {/* Filters & Search Toolbar */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#F8FAFC',
          }}
        >
          {/* Top Row: Role Filter Chips (Careers tab only) */}
          {activeTab === 'careers' && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: '#64748B' }}>
                Role:
              </Typography>
              {['All', ...careersRoles].map((roleItem) => (
                <Chip
                  key={roleItem}
                  label={roleItem}
                  onClick={() => {
                    setRoleFilter(roleItem);
                    setCareersPage(1);
                  }}
                  sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    bgcolor: roleFilter === roleItem ? '#2563EB' : '#FFFFFF',
                    color: roleFilter === roleItem ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: roleFilter === roleItem ? '#2563EB' : '#CBD5E1',
                    '&:hover': {
                      bgcolor: roleFilter === roleItem ? '#1D4ED8' : '#F1F5F9',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Bottom Row: Search & Filters Dropdowns */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <TextField
              size="small"
              placeholder={
                activeTab === 'general'
                  ? 'Search by name, mobile, email, industry...'
                  : 'Search by reference IGT-XXXXXX, applicant name, email, city...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search style={{ width: 18, height: 18, marginRight: 8, color: '#94A3B8' }} />,
              }}
              sx={{ width: 360, maxWidth: '100%', bgcolor: '#FFFFFF' }}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {activeTab === 'careers' && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                    Role:
                  </Typography>
                  <Select
                    size="small"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCareersPage(1);
                    }}
                    sx={{ bgcolor: '#FFFFFF', minWidth: 200 }}
                  >
                    <MenuItem value="All">All Roles</MenuItem>
                    {careersRoles.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}

            {activeTab === 'careers' && (
              <LocationFilter
                value={{ state: careersStateFilter, city: careersCityFilter }}
                onChange={({ state, city }) => {
                  setCareersStateFilter(state);
                  setCareersCityFilter(city);
                  setCareersPage(1);
                }}
                fetchOptions={fetchCareersLocationOptions}
              />
            )}

            {/* Status Filter */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                Status:
              </Typography>
              <Select
                size="small"
                value={activeTab === 'general' ? generalStatusFilter : careersStatusFilter}
                onChange={(e) => {
                  if (activeTab === 'general') {
                    setGeneralStatusFilter(e.target.value);
                    setGeneralPage(1);
                  } else {
                    setCareersStatusFilter(e.target.value);
                    setCareersPage(1);
                  }
                }}
                displayEmpty
                sx={{ bgcolor: '#FFFFFF', minWidth: 150 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {activeTab === 'general' ? (
                  <>
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Contacted">Contacted</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                    <MenuItem value="Under Review">Under Review</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Hired">Hired</MenuItem>
                  </>
                )}
              </Select>
            </Box>
          </Box>
        </Box>
      </Box>

        {/* Content Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : activeTab === 'general' ? (
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700, color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleGeneralSortToggle('name')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Name
                      {generalSortBy === 'name' ? (
                        generalSortOrder === 'ASC' ? <ArrowUp style={{ width: 14, height: 14, color: '#2563EB' }} /> : <ArrowDown style={{ width: 14, height: 14, color: '#2563EB' }} />
                      ) : (
                        <ArrowUpDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Email</TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleGeneralSortToggle('city')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      City / State
                      {generalSortBy === 'city' ? (
                        generalSortOrder === 'ASC' ? <ArrowUp style={{ width: 14, height: 14, color: '#2563EB' }} /> : <ArrowDown style={{ width: 14, height: 14, color: '#2563EB' }} />
                      ) : (
                        <ArrowUpDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Industry</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Applied For</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Submitted At</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generalData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                      No general enquiry records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  generalData.map((row) => {
                    const statusStyle = getGeneralStatusColor(row.status);
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>{row.name}</TableCell>
                        <TableCell sx={{ color: '#334155' }}>{row.mobile}</TableCell>
                        <TableCell sx={{ color: '#334155' }}>{row.email}</TableCell>
                        <TableCell sx={{ color: '#334155' }}>
                          {row.city || row.state ? `${row.city || '-'}${row.state ? `, ${row.state}` : ''}` : '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#475569' }}>{row.industry}</TableCell>
                        <TableCell sx={{ color: '#475569' }}>{row.applied_for}</TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={row.status}
                            onChange={(e) =>
                              handleGeneralStatusChange(row.id, e.target.value as GeneralEnquiryStatus)
                            }
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fieldset: { borderColor: statusStyle.border },
                              '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                            }}
                          >
                            <MenuItem value="New">New</MenuItem>
                            <MenuItem value="Contacted">Contacted</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                          {new Date(row.submitted_at).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => setSelectedEnquiry(row)}>
                                <Eye style={{ width: 18, height: 18, color: '#475569' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Enquiry">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteGeneralConfirm(row)}
                                sx={{
                                  color: '#DC2626',
                                  '&:hover': { bgcolor: '#FEF2F2' },
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
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Ref ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Role</TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleCareersSortToggle('full_name')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Applicant Name
                      {careersSortBy === 'full_name' ? (
                        careersSortOrder === 'ASC' ? <ArrowUp style={{ width: 14, height: 14, color: '#2563EB' }} /> : <ArrowDown style={{ width: 14, height: 14, color: '#2563EB' }} />
                      ) : (
                        <ArrowUpDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleCareersSortToggle('current_city')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      City / State
                      {careersSortBy === 'current_city' ? (
                        careersSortOrder === 'ASC' ? <ArrowUp style={{ width: 14, height: 14, color: '#2563EB' }} /> : <ArrowDown style={{ width: 14, height: 14, color: '#2563EB' }} />
                      ) : (
                        <ArrowUpDown style={{ width: 14, height: 14, color: '#94A3B8' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Experience</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Portfolio / Links</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Screening Flags</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {careersData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                      No career application records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  careersData.map((row) => {
                    const statusStyle = getCareersStatusColor(row.status);
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
                          {row.application_reference}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>{row.role}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {row.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {row.email} • {row.phone}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#334155' }}>
                          {row.current_city}{row.state ? `, ${row.state}` : ''}
                        </TableCell>
                        <TableCell sx={{ color: '#334155' }}>
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
                                  <ExternalLink style={{ width: 16, height: 16, color: '#2563EB' }} />
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
                                  <FileText style={{ width: 16, height: 16, color: '#059669' }} />
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
                                      bgcolor: '#FEF2F2',
                                      color: '#DC2626',
                                      border: '1px solid #FCA5A5',
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
                                    bgcolor: '#F0FDF4',
                                    color: '#16A34A',
                                    border: '1px solid #BBF7D0',
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
                            onChange={(e) =>
                              handleCareersStatusChange(row.id, e.target.value as CareersStatus)
                            }
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fieldset: { borderColor: statusStyle.border },
                              '& .MuiSelect-select': { py: 0.5, px: 1.5 },
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
                                <Eye style={{ width: 18, height: 18, color: '#475569' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Application">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteCareersConfirm(row)}
                                sx={{
                                  color: '#DC2626',
                                  '&:hover': { bgcolor: '#FEF2F2' },
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

        {/* Pagination Footer */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0' }}>
          <Pagination
            count={
              activeTab === 'general'
                ? Math.ceil(generalTotal / 10)
                : Math.ceil(careersTotal / 10)
            }
            page={activeTab === 'general' ? generalPage : careersPage}
            onChange={(_, page) => {
              if (activeTab === 'general') setGeneralPage(page);
              else setCareersPage(page);
            }}
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

      {/* General Enquiry Detail Dialog */}
      {selectedEnquiry && (
        <Dialog
          open={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          maxWidth="sm"
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
            General Enquiry Details
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {selectedEnquiry.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Contact Info
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                Mobile: {selectedEnquiry.mobile} | Email: {selectedEnquiry.email}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Industry & Applied For
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                Industry: {selectedEnquiry.industry} | Type: {selectedEnquiry.applied_for}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                IP Address & Submitted At
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                IP: {selectedEnquiry.ip_address || 'N/A'} | Date:{' '}
                {new Date(selectedEnquiry.submitted_at).toLocaleString()}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0' }}>
            <Button
              onClick={() => setSelectedEnquiry(null)}
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
      {/* Delete General Enquiry Confirmation Dialog */}
      {deleteGeneralConfirm && (
        <Dialog
          open={!!deleteGeneralConfirm}
          onClose={() => setDeleteGeneralConfirm(null)}
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
            <AlertTriangle style={{ width: 24, height: 24 }} /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#475569' }}>
              Are you sure you want to delete the general enquiry from <strong>{deleteGeneralConfirm.name}</strong>?
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: isDark ? '#94A3B8' : '#64748B' }}>
              This action is permanent and cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setDeleteGeneralConfirm(null)}
              disabled={deleting}
              sx={{ textTransform: 'none', fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteGeneralConfirm}
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Trash2 style={{ width: 16, height: 16 }} />}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
            >
              {deleting ? 'Deleting...' : 'Delete Enquiry'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Careers Application Confirmation Dialog */}
      {deleteCareersConfirm && (
        <Dialog
          open={!!deleteCareersConfirm}
          onClose={() => setDeleteCareersConfirm(null)}
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
              Are you sure you want to delete application <strong>{deleteCareersConfirm.application_reference}</strong> ({deleteCareersConfirm.full_name})?
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: isDark ? '#94A3B8' : '#64748B' }}>
              This action is permanent and cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setDeleteCareersConfirm(null)}
              disabled={deleting}
              sx={{ textTransform: 'none', fontWeight: 600, color: isDark ? '#CBD5E1' : '#475569' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteCareersConfirm}
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

export default EnquiriesPage;
