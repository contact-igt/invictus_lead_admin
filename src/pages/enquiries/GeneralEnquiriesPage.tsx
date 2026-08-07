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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  IconButton,
  Tooltip,
  Button,
  useTheme,
} from '@mui/material';
import { Search, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { RichKPICard } from 'components/ui/RichKPICard';
import {
  fetchGeneralEnquiries,
  updateGeneralEnquiryStatusApi,
  deleteGeneralEnquiryApi,
} from 'services/enquiry.service';
import type { GeneralEnquiry, GeneralEnquiryStatus } from 'types/enquiry';

export const GeneralEnquiriesPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState<GeneralEnquiry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<GeneralEnquiry | null>(null);

  // Delete Confirmation Dialog State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GeneralEnquiry | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Metrics overview counters
  const [metrics, setMetrics] = useState({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    closedCount: 0,
  });

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchGeneralEnquiries({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      setData(res.data || []);
      setTotal(res.total || 0);

      // Compute overview metrics from total dataset
      const allRes = await fetchGeneralEnquiries({ page: 1, limit: 100 });
      const allRows = allRes.data || [];
      setMetrics({
        total: allRes.total || 0,
        newCount: allRows.filter((r) => r.status === 'New').length,
        inProgressCount: allRows.filter((r) => r.status === 'Contacted' || r.status === 'In Progress').length,
        closedCount: allRows.filter((r) => r.status === 'Closed').length,
      });
    } catch (err) {
      console.error('Failed to load general enquiries', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, newStatus: GeneralEnquiryStatus) => {
    try {
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await updateGeneralEnquiryStatusApi(id, newStatus);
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
      await deleteGeneralEnquiryApi(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete general enquiry', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (status: GeneralEnquiryStatus) => {
    switch (status) {
      case 'New':
        return {
          bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
          color: isDark ? '#60A5FA' : '#2563EB',
          border: isDark ? 'rgba(96, 165, 250, 0.4)' : '#BFDBFE',
        };
      case 'Contacted':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
          color: isDark ? '#FBBF24' : '#D97706',
          border: isDark ? 'rgba(251, 191, 36, 0.4)' : '#FDE68A',
        };
      case 'In Progress':
        return {
          bg: isDark ? 'rgba(147, 51, 234, 0.2)' : '#F3E8FF',
          color: isDark ? '#C084FC' : '#7E22CE',
          border: isDark ? 'rgba(192, 132, 252, 0.4)' : '#E9D5FF',
        };
      case 'Closed':
        return {
          bg: isDark ? 'rgba(148, 163, 184, 0.2)' : '#F1F5F9',
          color: isDark ? '#CBD5E1' : '#475569',
          border: isDark ? 'rgba(203, 213, 225, 0.4)' : '#CBD5E1',
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
          Invictus General Enquiries Overview
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mt: 0.5 }}>
          Manage Invictus client enquiries submitted via website contact forms.
        </Typography>
      </Box>

      {/* Overview Metrics Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2.5 }}>
        <RichKPICard
          title="Total Enquiries"
          value={metrics.total}
          icon="hugeicons:file-text"
          color="primary"
          comparisonText="All time submissions"
        />
        <RichKPICard
          title="New Enquiries"
          value={metrics.newCount}
          icon="hugeicons:clock-01"
          color="info"
          comparisonText="Requires action"
        />
        <RichKPICard
          title="In Progress"
          value={metrics.inProgressCount}
          icon="hugeicons:user-check"
          color="warning"
          comparisonText="Contacted / Working"
        />
        <RichKPICard
          title="Closed Enquiries"
          value={metrics.closedCount}
          icon="hugeicons:checkmark-circle-02"
          color="success"
          comparisonText="Resolved & closed"
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
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justify: 'space-between',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          }}
        >
          <TextField
            size="small"
            placeholder="Search by name, mobile, email, industry..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: <Search style={{ width: 18, height: 18, marginRight: 8, color: '#94A3B8' }} />,
            }}
            sx={{
              width: 340,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
              borderRadius: 1.5,
              '& .MuiInputBase-input': {
                color: isDark ? '#F8FAFC' : '#0F172A',
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
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
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Industry</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Applied For</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>Submitted At</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: isDark ? '#64748B' : '#94A3B8' }}>
                      No general enquiry records found.
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
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>{row.name}</TableCell>
                        <TableCell sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>{row.mobile}</TableCell>
                        <TableCell sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>{row.email}</TableCell>
                        <TableCell sx={{ color: isDark ? '#94A3B8' : '#475569' }}>{row.industry}</TableCell>
                        <TableCell sx={{ color: isDark ? '#94A3B8' : '#475569' }}>{row.applied_for}</TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={row.status}
                            onChange={(e) => handleStatusChange(row.id, e.target.value as GeneralEnquiryStatus)}
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
                            <MenuItem value="Contacted">Contacted</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell sx={{ color: isDark ? '#64748B' : '#64748B', fontSize: '0.85rem' }}>
                          {new Date(row.submitted_at).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => setSelectedEnquiry(row)}>
                                <Eye style={{ width: 18, height: 18, color: isDark ? '#94A3B8' : '#475569' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Enquiry">
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

      {/* Detail Dialog */}
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
                Full Name
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
                Industry & Type
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                Industry: {selectedEnquiry.industry} | Type: {selectedEnquiry.applied_for}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                IP Address & Submitted Date
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                IP: {selectedEnquiry.ip_address || 'N/A'} | Date: {new Date(selectedEnquiry.submitted_at).toLocaleString()}
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
            <AlertTriangle style={{ width: 24, height: 24 }} /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: isDark ? '#CBD5E1' : '#475569' }}>
              Are you sure you want to delete the general enquiry from <strong>{deleteConfirmItem.name}</strong>?
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
              {deleting ? 'Deleting...' : 'Delete Enquiry'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default GeneralEnquiriesPage;