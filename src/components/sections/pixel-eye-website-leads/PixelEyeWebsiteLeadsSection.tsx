import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
import useColorMode from 'hooks/useColorMode';
import { Download, Plus } from 'lucide-react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loader/PageLoader';
import PixelEyeField from 'components/sections/pixel-eye/PixelEyeField';
import PixelEyeDatePicker from 'components/sections/pixel-eye/PixelEyeDatePicker';
import { PixelEyeCard, PixelEyePageHeader, PixelEyePageShell, getPixelEyeButtonSx } from 'components/sections/pixel-eye/pixelEyeUi';
import {
  useCreatePixelEyeWebsiteLead,
  useDeletePixelEyeWebsiteLead,
  useExportPixelEyeWebsiteLeads,
  usePixelEyeWebsiteLead,
  usePixelEyeWebsiteLeadSummary,
  usePixelEyeWebsiteLeads,
  useUpdatePixelEyeWebsiteLead,
} from 'hooks/usePixelEyeWebsiteLeadQuery';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';
import PixelEyeWebsiteLeadDeleteDialog from './PixelEyeWebsiteLeadDeleteDialog';
import PixelEyeWebsiteLeadFormDrawer, { PixelEyeWebsiteLeadDrawerMode } from './PixelEyeWebsiteLeadFormDrawer';
import PixelEyeWebsiteLeadViewDrawer from './PixelEyeWebsiteLeadViewDrawer';
import PixelEyeWebsiteLeadsTable from './PixelEyeWebsiteLeadsTable';
import {
  PIXEL_EYE_WEBSITE_LEAD_SERVICES,
  cleanPixelEyeWebsiteLeadPayload,
  extractDownloadFilename,
  getPixelEyeWebsiteLeadExportErrorMessage,
  getPixelEyeWebsiteLeadExportFallbackName,
  hasPixelEyeWebsiteLeadFilters,
} from './pixelEyeWebsiteLeadUtils';
import type {
  PixelEyeWebsiteLead,
  PixelEyeWebsiteLeadExportFormat,
  PixelEyeWebsiteLeadListParams,
  PixelEyeWebsiteLeadService,
  PixelEyeWebsiteLeadSummary,
} from 'types/pixelEyeWebsiteLead';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: string;
  helperText?: string;
  loading?: boolean;
}

const SummaryCard = ({ label, value, icon, helperText, loading = false }: SummaryCardProps) => {
  const { mode } = useColorMode();

  return (
    <PixelEyeCard sx={{ width: '100%', minWidth: 0, minHeight: 122, p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Box minWidth={0} flex={1}>
          <Typography
            variant="caption"
            sx={{
              color: mode === 'dark' ? '#94A3B8' : '#64748B',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="60%" height={38} sx={{ mt: 0.25 }} />
          ) : (
            <Typography
              variant="h5"
              fontWeight={900}
              mt={0.75}
              noWrap
              title={String(value)}
              sx={{ color: mode === 'dark' ? '#FFFFFF' : '#0F172A' }}
            >
              {value}
            </Typography>
          )}
          {helperText ? (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.35} noWrap>
              {helperText}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: mode === 'dark' ? 'rgba(34, 197, 94, 0.14)' : 'rgba(220, 252, 231, 1)',
            color: mode === 'dark' ? '#86EFAC' : '#15803D',
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon={icon} width={21} />
        </Box>
      </Stack>
    </PixelEyeCard>
  );
};
const EMPTY_SUMMARY: PixelEyeWebsiteLeadSummary = {
  total_leads: 0,
  today_leads: 0,
  this_month_leads: 0,
  top_service: null,
  top_service_count: 0,
};

const PixelEyeWebsiteLeadsSection = () => {
  const { mode } = useColorMode();
  const { clientKey } = useParams<{ clientKey: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const isPixelEyeModule = resolveClientModuleKey(clientKey) === 'pixeleye';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [service, setService] = useState<PixelEyeWebsiteLeadService | ''>('');
  const [utmSource, setUtmSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<PixelEyeWebsiteLeadDrawerMode>('create');
  const [selectedLead, setSelectedLead] = useState<PixelEyeWebsiteLead | null>(null);
  const [deleteLead, setDeleteLead] = useState<PixelEyeWebsiteLead | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);


  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: PixelEyeWebsiteLeadListParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      service: service || undefined,
      utm_source: utmSource.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [debouncedSearch, endDate, limit, page, service, startDate, utmSource],
  );

  const leadsQuery = usePixelEyeWebsiteLeads(clientKey, params, isPixelEyeModule);
  const summaryQuery = usePixelEyeWebsiteLeadSummary(clientKey, isPixelEyeModule);
  const detailQuery = usePixelEyeWebsiteLead(
    clientKey,
    selectedLead?.id ?? null,
    isPixelEyeModule && drawerOpen && drawerMode === 'view',
  );
  const createMutation = useCreatePixelEyeWebsiteLead(clientKey);
  const updateMutation = useUpdatePixelEyeWebsiteLead(clientKey);
  const deleteMutation = useDeletePixelEyeWebsiteLead(clientKey);
  const exportMutation = useExportPixelEyeWebsiteLeads(clientKey);

  const response = leadsQuery.data;
  const rows = response?.data ?? [];
  const summary = summaryQuery.data?.data ?? EMPTY_SUMMARY;
  const summaryLoading = !summaryQuery.data && (summaryQuery.isLoading || summaryQuery.isFetching);
  const summaryUnavailable = summaryQuery.isError;
  const pagination = response?.pagination ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedLead(null);
    setDrawerMode('create');
  };

  const openDrawer = (mode: PixelEyeWebsiteLeadDrawerMode, lead: PixelEyeWebsiteLead | null = null) => {
    setSelectedLead(lead);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleSubmit = (values: {
    name: string;
    mobile_number: string;
    service: string;
    ip_address: string;
    utm_source: string;
  }) => {
    const payload = cleanPixelEyeWebsiteLeadPayload(values);

    if (drawerMode === 'edit' && selectedLead) {
      updateMutation.mutate(
        { id: selectedLead.id, payload },
        { onSuccess: closeDrawer },
      );
      return;
    }

    createMutation.mutate(payload, { onSuccess: closeDrawer });
  };

  const handleDelete = () => {
    if (!deleteLead) return;
    deleteMutation.mutate(deleteLead.id, {
      onSuccess: () => setDeleteLead(null),
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setService('');
    setUtmSource('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handlePaginationChange = (nextPage: number, nextLimit: number) => {
    if (nextLimit !== limit) {
      setLimit(nextLimit);
      setPage(1);
      return;
    }
    setPage(nextPage);
  };

  const handleOpenExportMenu = (event: MouseEvent<HTMLElement>) => {
    if (isExporting) return;
    setExportMenuAnchor(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: PixelEyeWebsiteLeadExportFormat) => {
    handleCloseExportMenu();
    setIsExporting(true);

    const exportParams = {
      search: debouncedSearch || undefined,
      service: service || undefined,
      utm_source: utmSource.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    try {
      const response = await exportMutation.mutateAsync({ format, params: exportParams });
      const blob = new Blob([response.data], {
        type:
          response.headers['content-type'] ||
          (format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8'),
      });
      const fileName =
        extractDownloadFilename(response.headers['content-disposition']) ||
        getPixelEyeWebsiteLeadExportFallbackName(format);
      saveAs(blob, fileName);
    } catch (error) {
      enqueueSnackbar(getPixelEyeWebsiteLeadExportErrorMessage(error), { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isPixelEyeModule) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">
          PixelEye Website Leads is not available for this client.
        </Typography>
      </Box>
    );
  }

  if (leadsQuery.isLoading && !response) {
    return <PageLoader />;
  }

  const hasFilters = hasPixelEyeWebsiteLeadFilters(params);
  const activeLeadForView = detailQuery.data?.data ?? selectedLead;

  return (
    <PixelEyePageShell>
      <Stack direction="column" spacing={2.5} width={1} sx={{ flex: 1, minHeight: 0 }}>
      <PixelEyePageHeader
        eyebrow="WEBSITE LEAD CENTER"
        title="PixelEye Website Leads"
        subtitle="Manage website enquiries and service leads in the same CRM workspace."
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              onClick={handleOpenExportMenu}
              endIcon={<Download size={16} />}
              disabled={isExporting}
              sx={getPixelEyeButtonSx(mode, 'secondary')}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleCloseExportMenu}
            >
              <MenuItem onClick={() => void handleExport('csv')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => void handleExport('pdf')}>Export as PDF</MenuItem>
            </Menu>
            <Button
              variant="contained"
              onClick={() => openDrawer('create')}
              startIcon={<Plus size={17} />}
              sx={getPixelEyeButtonSx(mode, 'primary')}
            >
              Add Lead
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <SummaryCard label="Total Leads" value={summary.total_leads.toLocaleString()} icon="mdi:database-outline" loading={summaryLoading} />
        <SummaryCard label="Today" value={summary.today_leads.toLocaleString()} icon="mdi:calendar-today" loading={summaryLoading} />
        <SummaryCard label="This Month" value={summary.this_month_leads.toLocaleString()} icon="mdi:calendar-month-outline" loading={summaryLoading} />
        <SummaryCard
          label="Top Requested Service"
          value={summary.top_service || '—'}
          icon="mdi:star-outline"
          helperText={summary.top_service ? `${summary.top_service_count} leads` : 'No service selected yet'}
          loading={summaryLoading}
        />
      </Box>

      {summaryUnavailable ? (
        <Alert severity="warning">Summary metrics are temporarily unavailable.</Alert>
      ) : null}

      <PixelEyeCard
        sx={{
          p: 2,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ mb: 2 }}
        >
          <PixelEyeField
            label="Search"
            placeholder="Search name, mobile number, service or UTM source"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: { xs: '100%', md: 320 }, flex: '1 1 320px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="mdi:magnify" width={18} />
                </InputAdornment>
              ),
            }}
          />
          <PixelEyeField
            select
            label="Service"
            value={service}
            onChange={(event) => {
              setService(event.target.value as PixelEyeWebsiteLeadService | '');
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 220 }, flex: '1 1 220px' }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">
              <em>All services</em>
            </MenuItem>
            {PIXEL_EYE_WEBSITE_LEAD_SERVICES.map((serviceOption) => (
              <MenuItem key={serviceOption} value={serviceOption}>
                {serviceOption}
              </MenuItem>
            ))}
          </PixelEyeField>
          <PixelEyeField
            label="UTM Source"
            placeholder="Filter by UTM source"
            value={utmSource}
            onChange={(event) => {
              setUtmSource(event.target.value);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 220 }, flex: '1 1 220px' }}
          />
          <PixelEyeDatePicker
            label="Start Date"
            value={startDate}
            maxDate={endDate || undefined}
            onChange={(value) => {
              setStartDate(value);
              setPage(1);
            }}
            fullWidth
            sx={{ minWidth: { xs: '100%', sm: 160 }, flex: '0 1 160px' }}
          />
          <PixelEyeDatePicker
            label="End Date"
            value={endDate}
            minDate={startDate || undefined}
            disabled={!startDate}
            onChange={(value) => {
              setEndDate(value);
              setPage(1);
            }}
            fullWidth
            sx={{ minWidth: { xs: '100%', sm: 160 }, flex: '0 1 160px' }}
          />
          <Button variant="text" onClick={clearFilters} disabled={!hasFilters}>
            Clear Filters
          </Button>
        </Stack>

        <PixelEyeWebsiteLeadsTable
          rows={rows}
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          isLoading={leadsQuery.isLoading || leadsQuery.isFetching}
          hasFilters={hasFilters}
          onPaginationChange={handlePaginationChange}
          onView={(lead) => openDrawer('view', lead)}
          onEdit={(lead) => openDrawer('edit', lead)}
          onDelete={(lead) => setDeleteLead(lead)}
        />
      </PixelEyeCard>

      <PixelEyeWebsiteLeadFormDrawer
        open={drawerOpen && drawerMode !== 'view'}
        mode={drawerMode}
        lead={selectedLead}
        onSubmit={handleSubmit}
        onClose={closeDrawer}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />

      <PixelEyeWebsiteLeadViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        lead={activeLeadForView}
        onClose={closeDrawer}
      />

      <PixelEyeWebsiteLeadDeleteDialog
        open={Boolean(deleteLead)}
        lead={deleteLead}
        onClose={() => setDeleteLead(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isLoading}
      />
    </Stack>
    </PixelEyePageShell>
  );
};

export default PixelEyeWebsiteLeadsSection;











