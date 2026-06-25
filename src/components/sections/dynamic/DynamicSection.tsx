import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Paper, Stack, Drawer, Box, Button, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { saveAs } from 'file-saver';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import DynamicTable from './DynamicTable';
import DynamicForm from './DynamicForm';
import FollowUpHistoryModal from 'components/sections/pixel-eye-follow-ups/FollowUpHistoryModal';
import { TableConfig } from 'config/clients';
import { _axios } from 'helper/axios';

interface DynamicSectionProps {
  config: TableConfig;
  clientKey?: string;
}

const normalizeDateForCompare = (value?: unknown): string => {
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

const getLeadBusinessDate = (lead: any): string =>
  normalizeDateForCompare(lead.date) ||
  normalizeDateForCompare(lead.createdAt) ||
  normalizeDateForCompare(lead.created_at);

const getLeadActivityTime = (lead: any): number => {
  const updated = Date.parse(String(lead.updatedAt || lead.updated_at || ''));
  if (!Number.isNaN(updated)) return updated;

  const created = Date.parse(String(lead.createdAt || lead.created_at || ''));
  if (!Number.isNaN(created)) return created;

  return Number(lead.id || 0);
};

const sortByLatestActivity = (records: any[]): any[] =>
  records.slice().sort((a, b) => {
    const activityDiff = getLeadActivityTime(b) - getLeadActivityTime(a);
    if (activityDiff !== 0) return activityDiff;
    return Number(b?.id || 0) - Number(a?.id || 0);
  });

const extractFileName = (contentDisposition?: string): string | null => {
  const match = String(contentDisposition || '').match(/filename="?([^";]+)"?/i);
  return match?.[1] || null;
};

const DynamicSection = ({ config, clientKey }: DynamicSectionProps) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | string | null>(null);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isFollowUpHistoryOpen, setIsFollowUpHistoryOpen] = useState(false);
  const [selectedFollowUpHistoryLead, setSelectedFollowUpHistoryLead] = useState<any | null>(null);

  const isPixelEyeLeads = config.endpoint === '/pixeleye' && config.id === 'leads';
  const queryParams = isPixelEyeLeads && clientKey ? { _client_key: clientKey } : undefined;
  const queryKey = [`dynamic_data_${config.id}`, config.endpoint, clientKey ?? null];

  const { data, isLoading } = useQuery(
    queryKey,
    () => _axios('get', config.endpoint, undefined, 'application/json', queryParams),
    { staleTime: 5 * 60 * 1000 }
  );

  const visibleRecords = useMemo(() => {
    const records = data?.data || [];
    const normalizedSearch = searchText.trim().toLowerCase();
    const sourceRecords = isPixelEyeLeads ? sortByLatestActivity(records) : records;
    if (!normalizedSearch) return sourceRecords;

    return sourceRecords.filter((record: any) =>
      config.columns.some((column) =>
        String(record?.[column.field] ?? '').toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [config.columns, data?.data, isPixelEyeLeads, searchText]);

  const tableRecords = useMemo(() => {
    if (!isPixelEyeLeads) return visibleRecords;
    if (!exportFromDate && !exportToDate) return visibleRecords;

    return visibleRecords.filter((lead: any) => {
      const leadDate = getLeadBusinessDate(lead);
      if (!leadDate) return false;
      if (exportFromDate && leadDate < exportFromDate) return false;
      if (exportToDate && leadDate > exportToDate) return false;
      return true;
    });
  }, [exportFromDate, exportToDate, isPixelEyeLeads, visibleRecords]);

  const mutation = useMutation(
    (payload: any) => {
      if (selectedRecord) {
        return _axios('patch', `${config.endpoint}/${selectedRecord.id}`, payload);
      }
      // Include _client_key so the backend can resolve client_id for super-admin
      const createPayload = clientKey ? { ...payload, _client_key: clientKey } : payload;
      return _axios('post', config.endpoint, createPayload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        handleCloseDrawer();
      },
      onError: (error) => {
        console.error('Mutation Error:', error);
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number | string) => _axios('delete', `${config.endpoint}/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      }
    }
  );

  const inlineUpdateMutation = useMutation(
    ({ id, field, value }: { id: number | string; field: string; value: string }) =>
      _axios('patch', `${config.endpoint}/${id}`, { [field]: value }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Failed to update this field';
        enqueueSnackbar(message, { variant: 'error' });
        console.error('Inline update error:', error);
      }
    }
  );

  const handleOpenDrawer = (record: any | null = null, viewOnly = false) => {
    setSelectedRecord(record);
    setIsViewOnly(viewOnly);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setIsViewOnly(false);
    setSelectedRecord(null);
  };

  const handleEdit = (id: number | string) => {
    const record = data?.data?.find((r: any) => r.id === id);
    if (record) handleOpenDrawer(record, false);
  };

  const handleView = (id: number | string) => {
    const record = data?.data?.find((r: any) => r.id === id);
    if (record) handleOpenDrawer(record, true);
  };

  const handleDeletePrompt = (id: number | string) => {
    setSelectedDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (selectedDeleteId === null) return;

    deleteMutation.mutate(selectedDeleteId, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
      },
    });
  };

  const handleInlineUpdate = (id: number | string, field: string, value: string) => {
    inlineUpdateMutation.mutate({ id, field, value });
  };

  const handleOpenFollowUpHistory = (lead: any) => {
    setSelectedFollowUpHistoryLead(lead);
    setIsFollowUpHistoryOpen(true);
  };

  const handleCloseFollowUpHistory = () => {
    setIsFollowUpHistoryOpen(false);
    setSelectedFollowUpHistoryLead(null);
  };

  const getExportRows = () => {
    if (!exportFromDate || !exportToDate) {
      enqueueSnackbar('Please select date range', { variant: 'warning' });
      return null;
    }

    if (exportFromDate > exportToDate) {
      enqueueSnackbar('From Date cannot be after To Date', { variant: 'warning' });
      return null;
    }

    const rows = visibleRecords.filter((lead: any) => {
      const leadDate = getLeadBusinessDate(lead);
      return Boolean(leadDate) && leadDate >= exportFromDate && leadDate <= exportToDate;
    });

    if (rows.length === 0) {
      enqueueSnackbar('No leads found for selected date range', { variant: 'info' });
      return null;
    }

    return rows;
  };

  const exportFileBaseName = `pixel-eye-leads-${exportFromDate}-to-${exportToDate}`;

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
          search: searchText.trim() || undefined,
          ...(clientKey ? { _client_key: clientKey } : {}),
        },
        { responseType: 'blob', returnRawResponse: true },
      );
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || (format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8'),
      });
      const fileName = extractFileName(response.headers['content-disposition']) || `${exportFileBaseName}.${format}`;
      saveAs(blob, fileName);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || `Failed to export ${format.toUpperCase()}`;
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <Stack direction="column" spacing={1.5} width="100%" p={3.5}>
      <PageTitle
        title={config.title}
        btnText={` ${config.title}`}
        isAddEnable
        searchText={searchText}
        handleInputChange={(e: any) => setSearchText(e.target.value)}
        openModal={() => handleOpenDrawer(null)}
      />

      <Paper
        elevation={0}
        sx={{
          p: isPixelEyeLeads ? 2 : 0,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {isPixelEyeLeads && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="From Date"
              type="date"
              value={exportFromDate}
              onChange={(event) => setExportFromDate(event.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To Date"
              type="date"
              value={exportToDate}
              onChange={(event) => setExportToDate(event.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            {(exportFromDate || exportToDate) && (
              <Button
                variant="text"
                onClick={() => {
                  setExportFromDate('');
                  setExportToDate('');
                }}
              >
                Clear Dates
              </Button>
            )}
            <Button variant="outlined" onClick={() => void handleExport('csv')} disabled={isLoading || isExporting}>
              Export CSV
            </Button>
            <Button variant="outlined" onClick={() => void handleExport('pdf')} disabled={isLoading || isExporting}>
              Export PDF
            </Button>
          </Box>
        )}
        <DynamicTable
          config={config}
          data={isPixelEyeLeads ? tableRecords : data?.data || []}
          searchText={searchText}
          isLoading={isLoading}
          onInlineUpdate={handleInlineUpdate}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeletePrompt}
          onFollowUpHistoryClick={isPixelEyeLeads ? handleOpenFollowUpHistory : undefined}
        />
      </Paper>

      <Popup
        open={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        showOnClose={false}
      >
        <ConfirmAlert
          title="Are you sure you want to delete this record?"
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleteConfirmOpen(false);
            setSelectedDeleteId(null);
          }}
          isLoading={deleteMutation.isLoading}
        />
      </Popup>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100vw', sm: 500 }, borderLeft: 0 }
        }}
      >
        <DynamicForm
          title={config.title}
          columns={config.columns}
          initialValues={selectedRecord}
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={handleCloseDrawer}
          isLoading={mutation.isLoading}
          isReadOnly={isViewOnly}
        />
      </Drawer>

      <FollowUpHistoryModal
        open={isFollowUpHistoryOpen}
        onClose={handleCloseFollowUpHistory}
        leadId={selectedFollowUpHistoryLead?.id ?? null}
        clientKey={clientKey}
        customerName={selectedFollowUpHistoryLead?.customer_name}
        phoneNumber={selectedFollowUpHistoryLead?.phone_number}
      />
    </Stack>
  );
};

export default DynamicSection;
