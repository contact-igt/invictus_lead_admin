import {
  usePixelEyeQuery,
  useCreatePixelEyeMutation,
  useUpdatePixelEyeMutation,
  useUpdatePixelEyeFollowUpOutcomeMutation,
  useDeletePixelEyeMutation,
  CreatePixelEyePayload,
  UpdatePixelEyePayload,
} from 'components/hooks/usePixelEyeQuery';
import PixelEyeTable, { PixelEyeRow } from './pixelEyeTable';
import PixelEyeLeadDrawer, { PixelEyeLeadFormValues } from './PixelEyeLeadDrawer';
import PixelEyeNotesDrawer from './PixelEyeNotesDrawer';
import PixelEyeDeleteDrawer from './PixelEyeDeleteDrawer';
import PageLoader from 'components/loader/PageLoader';
import Button from '@mui/material/Button';
import { useState, useMemo } from 'react';
import { Box, MenuItem, InputAdornment, Stack, IconButton, Tooltip } from '@mui/material';
import { ALL_STATUSES } from './pixelEyeStatuses';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeClientKey } from 'utils/clientKey';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import useColorMode from 'hooks/useColorMode';
import { Search, Download, Plus, RotateCcw, AlertTriangle, Clock3 } from 'lucide-react';
import { _axios } from 'helper/axios';
import {
  PixelEyeCard,
  PixelEyePageHeader,
  PixelEyePageShell,
  getPixelEyeButtonSx,
} from './pixelEyeUi';
import PixelEyeDatePicker from './PixelEyeDatePicker';
import PixelEyeField from './PixelEyeField';
import {
  buildFollowUpPageBuckets,
  getTodayIsoInIst,
  isCallReceivedOutcomePendingLead,
  shouldIncludeInManualFollowUpQueue,
} from '../pixel-eye-overview/dashboardUtils';

const ENABLE_PIXEL_EYE_LEAD_DETAIL_NAVIGATION = true;

const normalizeDateForCompare = (value?: string | null): string => {
  const text = String(value || '').trim();
  if (!text) return '';

  const directDate = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (directDate) return directDate[0];

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLeadBusinessDate = (lead: PixelEyeRow): string =>
  normalizeDateForCompare(lead.date) ||
  normalizeDateForCompare(lead.createdAt) ||
  normalizeDateForCompare(lead.created_at);

const getMutationErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

const isManualFollowUpSignalResponse = (response: any): boolean => {
  const result = String(response?.result || response?.data?.result || '').trim().toLowerCase();
  const highlightState = String(
    response?.followup_highlight_state ||
    response?.data?.followup_highlight_state ||
    response?.data?.lead?.followup_highlight_state ||
    '',
  ).trim().toUpperCase();
  const normalAttentionState = String(
    response?.normal_lead_attention_state ||
    response?.data?.normal_lead_attention_state ||
    response?.data?.lead?.normal_lead_attention_state ||
    '',
  ).trim().toUpperCase();
  const needsManualDayOutcome = Boolean(
    response?.needs_manual_day_outcome ||
    response?.data?.needs_manual_day_outcome ||
    response?.data?.lead?.needs_manual_day_outcome,
  );

  return (
    result === 'same_number_outcome_pending' ||
    result === 'manual_followup_signal_received' ||
    result === 'call_received_outcome_pending' ||
    highlightState === 'CALL_RECEIVED_OUTCOME_PENDING' ||
    normalAttentionState === 'SAME_NUMBER_OUTCOME_PENDING' ||
    needsManualDayOutcome
  );
};

const extractFileName = (contentDisposition?: string): string | null => {
  const match = String(contentDisposition || '').match(/filename="?([^";]+)"?/i);
  return match?.[1] || null;
};

const PixelEyeSection = () => {
  const { mode } = useColorMode();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();
  const createMutation = useCreatePixelEyeMutation();
  const updateMutation = useUpdatePixelEyeMutation();
  const outcomeMutation = useUpdatePixelEyeFollowUpOutcomeMutation();
  const deleteMutation = useDeletePixelEyeMutation();
  const userRole = (user?.role || '').toLowerCase().trim();
  const isSuperAdmin = userRole === 'super-admin';
  /**
   * Role-based access flow for Pixel-Eye Lead Management:
   * - super-admin: Global oversight
   * - admin: Client-level administrator
   * - client: Client-level manager (this is the primary role for client-side managers)
   */
  const canDeleteLead = userRole === 'super-admin' || userRole === 'admin' || userRole === 'client';

  const activeClientKey = normalizeClientKey(
    isSuperAdmin ? urlClientKey : user?.clientKey,
  );
  const hasScopedClientContext = !isSuperAdmin || Boolean(activeClientKey);

  const { data: leads = [], isLoading } = usePixelEyeQuery(
    isSuperAdmin ? activeClientKey : undefined,
    { enabled: hasScopedClientContext },
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<PixelEyeRow | null>(null);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [notesRow, setNotesRow] = useState<PixelEyeRow | null>(null);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<PixelEyeRow | null>(null);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const manualFollowUpLeads = useMemo(
    () => leads.filter((lead: PixelEyeRow) => shouldIncludeInManualFollowUpQueue(lead as any)),
    [leads],
  );
  const priorityFollowUpCount = useMemo(
    () => manualFollowUpLeads.filter((lead: PixelEyeRow) => isCallReceivedOutcomePendingLead(lead as any)).length,
    [manualFollowUpLeads],
  );
  const queueFollowUpBuckets = useMemo(
    () => buildFollowUpPageBuckets(
      manualFollowUpLeads.filter((lead: PixelEyeRow) => !isCallReceivedOutcomePendingLead(lead as any)) as any,
    ),
    [manualFollowUpLeads],
  );
  const todayFollowUpCount = useMemo(() => {
    const todayIso = getTodayIsoInIst();

    return queueFollowUpBuckets.todayLeads.filter(
      (lead) => normalizeDateForCompare(lead.follow_up_date) === todayIso,
    ).length;
  }, [queueFollowUpBuckets]);
  const overdueFollowUpCount = queueFollowUpBuckets.overdueCount;

  const navigateToFollowUps = (section?: string) => {
    if (isSuperAdmin && activeClientKey) {
      navigate(`/pages/d/${activeClientKey}/follow-ups${section ? `?section=${section}` : ''}`);
      return;
    }

    navigate(`/pixel-eye/follow-ups${section ? `?section=${section}` : ''}`);
  };

  const renderFollowUpShortcutCard = ({
    title,
    count,
    subtitle,
    icon,
    iconBg,
    iconColor,
    onClick,
  }: {
    title: string;
    count: number;
    subtitle: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    onClick: () => void;
  }) => (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <PixelEyeCard
        sx={{
          p: 3,
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow:
              mode === 'dark' ? '0 12px 30px rgba(0,0,0,0.32)' : '0 12px 28px rgba(15,23,42,0.08)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Box
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {title}
            </Box>
            <Box sx={{ mt: 1, fontSize: { xs: '2rem', md: '2.25rem' }, fontWeight: 900, lineHeight: 1 }}>
              {count.toLocaleString()}
            </Box>
            <Box sx={{ mt: 1, fontSize: 13, color: 'text.secondary' }}>{subtitle}</Box>
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: iconBg,
              color: iconColor,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </PixelEyeCard>
    </Box>
  );

  const handleAdd = () => {
    setEditRow(null);
    setFormOpen(true);
  };

  const handleEdit = (row: PixelEyeRow) => {
    setEditRow(row);
    setFormOpen(true);
  };

  const handleOpenNotesDrawer = (row: PixelEyeRow) => {
    setNotesRow(row);
    setNotesDrawerOpen(true);
  };

  const handleOpenLeadDetail = (row: PixelEyeRow) => {
    if (isSuperAdmin && activeClientKey) {
      navigate(`/pages/d/${activeClientKey}/pixel-eye/leads/${row.id}`);
      return;
    }

    navigate(`/pixel-eye/leads/${row.id}`);
  };

  const handleInlineStatusChange = (id: number, value: string) => {
    updateMutation.mutate(
      { id, status: value, clientKey: isSuperAdmin ? activeClientKey : undefined },
      {
        onError: (error: any) => {
          enqueueSnackbar(getMutationErrorMessage(error, 'Failed to update status'), {
            variant: 'error',
          });
        },
      },
    );
  };

  const handleInlineDayChange = (id: number, day: string, value: string) => {
    if (userRole === 'client') {
      outcomeMutation.mutate(
        { id, status: value },
        {
          onError: (error: any) => {
            enqueueSnackbar(
              getMutationErrorMessage(error, `Failed to update ${day.replace('_', ' ')}`),
              {
                variant: 'error',
              },
            );
          },
        },
      );
      return;
    }

    updateMutation.mutate(
      {
        id,
        [day]: value,
        clientKey: isSuperAdmin ? activeClientKey : undefined,
      },
      {
        onError: (error: any) => {
          enqueueSnackbar(
            getMutationErrorMessage(error, `Failed to update ${day.replace('_', ' ')}`),
            {
              variant: 'error',
            },
          );
        },
      },
    );
  };

  const handleInlineFollowUpDateChange = (id: number, value: string) => {
    updateMutation.mutate(
      {
        id,
        follow_up_date: value,
        clientKey: isSuperAdmin ? activeClientKey : undefined,
      },
      {
        onError: (error: any) => {
          enqueueSnackbar(getMutationErrorMessage(error, 'Failed to update follow-up date'), {
            variant: 'error',
          });
        },
      },
    );
  };

  const handleOpenDeleteDrawer = (row: any) => {
    if (!row) return;
    setDeleteRow(row);
    setDeleteDrawerOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow?.id) return;

    deleteMutation.mutate({ id: deleteRow.id, clientKey: isSuperAdmin ? activeClientKey : undefined }, {
      onSuccess: () => {
        setDeleteDrawerOpen(false);
        setDeleteRow(null);
        enqueueSnackbar('Lead deleted successfully', { variant: 'success' });
      },
      onError: (error: any) => {
        enqueueSnackbar(getMutationErrorMessage(error, 'Failed to delete lead'), {
          variant: 'error',
        });
      },
    });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditRow(null);
  };

  const closeNotesDrawer = () => {
    setNotesDrawerOpen(false);
    setNotesRow(null);
  };

  const buildLeadPayload = (values: PixelEyeLeadFormValues): PixelEyeLeadFormValues => {
    const payload = { ...values };
    if (!String(payload.follow_up_date || '').trim()) {
      delete payload.follow_up_date;
    }

    return payload;
  };

  const handleFormSubmit = (values: PixelEyeLeadFormValues) => {
    const leadPayload = buildLeadPayload(values);

    if (editRow && editRow.id) {
      // Close only after the API call succeeds so the user sees errors if it fails.
      updateMutation.mutate({
        id: editRow.id,
        ...leadPayload,
        clientKey: isSuperAdmin ? activeClientKey : undefined,
      } as UpdatePixelEyePayload, {
        onSuccess: closeForm,
        onError: (error: any) => {
          enqueueSnackbar(getMutationErrorMessage(error, 'Failed to save lead'), {
            variant: 'error',
          });
        },
      });
    } else {
      const payload: CreatePixelEyePayload = activeClientKey
        ? { ...leadPayload, _client_key: activeClientKey }
        : leadPayload;
      createMutation.mutate(payload, {
        onSuccess: (response) => {
          closeForm();
          enqueueSnackbar(
            isManualFollowUpSignalResponse(response)
              ? 'Same number matched an active lead. Please update the next day outcome manually.'
              : 'New lead created',
            { variant: 'success' },
          );
        },
        onError: (error: any) => {
          enqueueSnackbar(getMutationErrorMessage(error, 'Failed to create lead'), {
            variant: 'error',
          });
        },
      });
    }
  };

  const handleFormCancel = closeForm;

  const handleNotesSubmit = (notes: string) => {
    if (!notesRow?.id) return;

    updateMutation.mutate(
      {
        id: notesRow.id,
        notes,
        clientKey: isSuperAdmin ? activeClientKey : undefined,
      },
      {
        onSuccess: closeNotesDrawer,
        onError: (error: any) => {
          enqueueSnackbar(getMutationErrorMessage(error, 'Failed to save notes'), {
            variant: 'error',
          });
        },
      },
    );
  };

  // --- Filtering ---
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const filteredLeads = useMemo(() => {
    return leads.filter((lead: PixelEyeRow) => {

      const matchesSearch =
        !search ||
        lead.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone_number?.includes(search);
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const leadDate = getLeadBusinessDate(lead);
      const matchesDateFrom = !exportFromDate || (Boolean(leadDate) && leadDate >= exportFromDate);
      const matchesDateTo = !exportToDate || (Boolean(leadDate) && leadDate <= exportToDate);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [exportFromDate, exportToDate, leads, search, statusFilter]);

  const prioritizedLeads = useMemo(() => {
    const getLeadTimestamp = (lead: PixelEyeRow) => {
      const parsed = new Date(
        lead.updatedAt || lead.updated_at || lead.createdAt || lead.created_at || '',
      );
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    return [...filteredLeads].sort((a, b) => {
      const aPriority = a.needs_manual_day_outcome ? 1 : 0;
      const bPriority = b.needs_manual_day_outcome ? 1 : 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return getLeadTimestamp(b) - getLeadTimestamp(a);
    });
  }, [filteredLeads]);
  const handleDeleteSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) return;

    const idsToDelete = [...selectedLeadIds];

    try {
      for (const id of idsToDelete) {
        await deleteMutation.mutateAsync({
          id,
          clientKey: isSuperAdmin ? activeClientKey : undefined,
        });
      }

      enqueueSnackbar(
        idsToDelete.length + ' lead' + (idsToDelete.length === 1 ? '' : 's') + ' deleted permanently',
        { variant: 'success' },
      );
      setSelectedLeadIds([]);
    } catch (error: any) {
      enqueueSnackbar(getMutationErrorMessage(error, 'Failed to delete selected leads'), {
        variant: 'error',
      });
    }
  };
  const getExportRows = (): PixelEyeRow[] | null => {
    if (!exportFromDate || !exportToDate) {
      enqueueSnackbar('Please select date range', { variant: 'warning' });
      return null;
    }

    if (exportFromDate > exportToDate) {
      enqueueSnackbar('From Date cannot be after To Date', { variant: 'warning' });
      return null;
    }

    const rows = filteredLeads;

    if (rows.length === 0) {
      enqueueSnackbar('No leads found for selected date range', { variant: 'info' });
      return null;
    }

    return rows;
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    const rows = getExportRows();
    if (!rows) return;

    setIsExporting(true);
    try {
      const response = await _axios(
        'get',
        '/pixeleye/export',
        null,
        'application/json',
        {
          format,
          dateFrom: exportFromDate,
          dateTo: exportToDate,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
          ...(isSuperAdmin && activeClientKey ? { _client_key: activeClientKey } : {}),
        },
        { responseType: 'blob', returnRawResponse: true },
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || (format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8'),
      });
      const fileName =
        extractFileName(response.headers['content-disposition']) ||
        `pixel-eye-leads-${exportFromDate}-to-${exportToDate}.${format}`;
      saveAs(blob, fileName);
    } catch (error: any) {
      enqueueSnackbar(getMutationErrorMessage(error, `Failed to export ${format.toUpperCase()}`), {
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasScopedClientContext) {
    return (
      <PixelEyePageShell>
        <PixelEyeCard sx={{ p: 4 }}>
          <Stack spacing={1}>
            <Box sx={{ fontWeight: 800, fontSize: '1.25rem' }}>Please select a client</Box>
            <Box sx={{ color: 'text.secondary' }}>
              Select a client from the route context to load PixelEye leads.
            </Box>
          </Stack>
        </PixelEyeCard>
      </PixelEyePageShell>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <PixelEyePageShell>
      <PixelEyePageHeader
        eyebrow="CRM LEAD CENTER"
        title="PixelEye Dashboard"
        subtitle="Manage the core lead queue, keep follow-up dates moving, and export the current filtered view without breaking the table workflow."
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleAdd}
              sx={{ ...getPixelEyeButtonSx(mode, 'primary'), height: 48, px: 3 }}
            >
              Add New Lead
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          mb: 4,
        }}
      >
        {renderFollowUpShortcutCard({
          title: "Today's Follow-ups",
          count: todayFollowUpCount,
          subtitle: 'Open today queue',
          icon: <Search size={20} />,
          iconBg: mode === 'dark' ? 'rgba(22, 163, 74, 0.14)' : 'rgba(220, 252, 231, 1)',
          iconColor: mode === 'dark' ? '#86EFAC' : '#15803D',
          onClick: () => navigateToFollowUps('today'),
        })}

        {renderFollowUpShortcutCard({
          title: 'Overdue Follow-ups',
          count: overdueFollowUpCount,
          subtitle: 'Review delayed queue',
          icon: <AlertTriangle size={20} />,
          iconBg: mode === 'dark' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(254, 226, 226, 1)',
          iconColor: mode === 'dark' ? '#FCA5A5' : '#B91C1C',
          onClick: () => navigateToFollowUps('overdue'),
        })}

        {renderFollowUpShortcutCard({
          title: 'Needs Outcome',
          count: priorityFollowUpCount,
          subtitle: 'Open outcome-pending leads',
          icon: <Clock3 size={20} />,
          iconBg: mode === 'dark' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(254, 243, 199, 1)',
          iconColor: mode === 'dark' ? '#FCD34D' : '#B45309',
          onClick: () => navigateToFollowUps('priority'),
        })}
      </Box>

      <PixelEyeCard sx={{ mb: 4 }}>
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'minmax(240px, 1.35fr) minmax(190px, 0.95fr) minmax(160px, 0.8fr) minmax(160px, 0.8fr) auto',
                },
                alignItems: 'end',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <PixelEyeField
                  placeholder="Search name, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: 'text.secondary', ml: 0.5 }}>
                        <Search size={18} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: '100%' }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <PixelEyeField
                  select
                  label="Status Filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                  sx={{ width: '100%' }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {ALL_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </PixelEyeField>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <PixelEyeDatePicker
                  label="From"
                  value={exportFromDate}
                  maxDate={exportToDate || undefined}
                  onChange={(newFrom) => {
                    setExportFromDate(newFrom);
                    if (exportToDate && newFrom > exportToDate) {
                      setExportToDate(newFrom);
                    }
                  }}
                  fullWidth={false}
                  sx={{ width: '100%' }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <PixelEyeDatePicker
                  label="To"
                  value={exportToDate}
                  minDate={exportFromDate || undefined}
                  disabled={!exportFromDate}
                  onChange={(newTo) => setExportToDate(newTo)}
                  fullWidth={false}
                  sx={{ width: '100%' }}
                />
              </Box>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
                sx={{ minHeight: 46, minWidth: 46 }}
              >
                {(exportFromDate || exportToDate) && (
                  <Tooltip title="Reset dates">
                    <IconButton
                      onClick={() => {
                        setExportFromDate('');
                        setExportToDate('');
                      }}
                      size="small"
                      sx={{
                        height: 42,
                        width: 42,
                        borderRadius: '12px',
                        border: mode === 'dark'
                          ? '1px solid rgba(134, 239, 172, 0.22)'
                          : '1px solid rgba(21, 106, 69, 0.18)',
                        color: mode === 'dark' ? '#86EFAC' : '#156A45',
                        backgroundColor: mode === 'dark'
                          ? 'rgba(20, 45, 30, 0.7)'
                          : 'rgba(240, 253, 244, 0.95)',
                        flexShrink: 0,
                        '&:hover': {
                          backgroundColor: mode === 'dark'
                            ? 'rgba(22, 60, 36, 0.92)'
                            : 'rgba(220, 252, 231, 1)',
                        },
                      }}
                    >
                      <RotateCcw size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent={{ xs: 'stretch', xl: 'flex-end' }}
              useFlexGap
              sx={{
                width: '100%',
                pt: 0,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => void handleExport('csv')}
                disabled={isLoading || isExporting || !exportFromDate || !exportToDate}
                startIcon={<Download size={16} />}
                sx={{
                  ...getPixelEyeButtonSx(mode, 'secondary'),
                  height: 46,
                  px: 2,
                  borderRadius: '14px',
                  minWidth: { xs: '100%', sm: 140 },
                  whiteSpace: 'nowrap',
                  '&.Mui-disabled': {
                    borderColor: mode === 'dark' ? 'rgba(134, 239, 172, 0.14)' : 'rgba(203, 213, 225, 0.9)',
                    color: mode === 'dark' ? 'rgba(223, 255, 227, 0.52)' : 'rgba(71, 85, 105, 0.78)',
                    backgroundColor: mode === 'dark' ? 'rgba(16, 33, 24, 0.72)' : 'rgba(248, 250, 252, 0.95)',
                  },
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                onClick={() => void handleExport('pdf')}
                disabled={isLoading || isExporting || !exportFromDate || !exportToDate}
                startIcon={<Download size={16} />}
                sx={{
                  ...getPixelEyeButtonSx(mode, 'secondary'),
                  height: 46,
                  px: 2,
                  borderRadius: '14px',
                  minWidth: { xs: '100%', sm: 140 },
                  whiteSpace: 'nowrap',
                  '&.Mui-disabled': {
                    borderColor: mode === 'dark' ? 'rgba(134, 239, 172, 0.14)' : 'rgba(203, 213, 225, 0.9)',
                    color: mode === 'dark' ? 'rgba(223, 255, 227, 0.52)' : 'rgba(71, 85, 105, 0.78)',
                    backgroundColor: mode === 'dark' ? 'rgba(16, 33, 24, 0.72)' : 'rgba(248, 250, 252, 0.95)',
                  },
                }}
              >
                Export PDF
              </Button>
            </Stack>
          </Box>
        </Box>
      </PixelEyeCard>

      <PixelEyeCard sx={{ borderRadius: '22px' }}>
        {selectedLeadIds.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Box sx={{ fontSize: 13, fontWeight: 700, color: mode === 'dark' ? '#A7F3D0' : '#156A45' }}>
              {selectedLeadIds.length} selected
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                disabled={selectedLeadIds.length === 0 || deleteMutation.isLoading}
                onClick={() => void handleDeleteSelectedLeads()}
                sx={getPixelEyeButtonSx(mode, 'secondary')}
              >
                Delete selected
              </Button>
            </Stack>
          </Stack>
        )}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <PixelEyeTable
            rows={prioritizedLeads}
            onEdit={handleEdit}
            onNotes={handleOpenNotesDrawer}
            onDelete={canDeleteLead ? handleOpenDeleteDrawer : undefined}
            onStatusChange={handleInlineStatusChange}
            onDayChange={handleInlineDayChange}
            onFollowUpDateChange={handleInlineFollowUpDateChange}
            userRole={userRole}
            onRowClick={ENABLE_PIXEL_EYE_LEAD_DETAIL_NAVIGATION ? handleOpenLeadDetail : undefined}
            selectedRowIds={selectedLeadIds}
            onSelectedRowIdsChange={setSelectedLeadIds}
          />
        </Box>
      </PixelEyeCard>

      {/* --- Drawers & Dialogs --- */}
      <PixelEyeLeadDrawer
        mode={editRow ? 'edit' : 'create'}
        open={formOpen}
        lead={editRow}
        onClose={handleFormCancel}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
      <PixelEyeNotesDrawer
        open={notesDrawerOpen}
        lead={notesRow}
        onClose={closeNotesDrawer}
        onSubmit={handleNotesSubmit}
        isLoading={updateMutation.isLoading}
      />
      <PixelEyeDeleteDrawer
        open={deleteDrawerOpen}
        lead={deleteRow}
        onClose={() => {
          setDeleteDrawerOpen(false);
          setDeleteRow(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isLoading}
      />
    </PixelEyePageShell>
  );
};

export default PixelEyeSection;


