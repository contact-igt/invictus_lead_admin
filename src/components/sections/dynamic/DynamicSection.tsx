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
import { TableConfig } from 'config/clients';
import { _axios } from 'helper/axios';

const PIXELEYE_EXPORT_COLUMNS = [
  { key: 'date', label: 'Date', width: 54 },
  { key: 'time', label: 'Time', width: 42 },
  { key: 'customer_name', label: 'Customer Name', width: 82 },
  { key: 'phone_number', label: 'Phone', width: 64 },
  { key: 'agent_name', label: 'Agent', width: 58 },
  { key: 'status', label: 'Status', width: 70 },
  { key: 'follow_up_date', label: 'Follow Up', width: 56 },
  { key: 'source', label: 'Source', width: 45 },
  { key: 'type_of_enquiry', label: 'Enquiry', width: 68 },
  { key: 'call_id', label: 'Call ID', width: 70 },
  { key: 'createdAt', label: 'Created At', width: 68 },
  { key: 'updatedAt', label: 'Updated At', width: 68 },
] as const;

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

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLeadValue = (lead: any, key: string): string => {
  if (key === 'createdAt') return String(lead.createdAt || lead.created_at || '');
  if (key === 'updatedAt') return String(lead.updatedAt || lead.updated_at || '');
  return String(lead[key] ?? '');
};

const escapeCsvValue = (value: string): string => {
  const text = value.replace(/\r?\n|\r/g, ' ').trim();
  return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildPixelEyeCsv = (rows: any[]): string => {
  const header = PIXELEYE_EXPORT_COLUMNS.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows.map((row) =>
    PIXELEYE_EXPORT_COLUMNS.map((column) => escapeCsvValue(getLeadValue(row, column.key))).join(','),
  );
  return [header, ...body].join('\n');
};

const escapePdfText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\r?\n|\r/g, ' ');

const truncateText = (value: string, maxChars: number): string => {
  const text = String(value || '').trim();
  return text.length <= maxChars ? text : `${text.slice(0, Math.max(maxChars - 3, 0))}...`;
};

const addPdfText = (commands: string[], x: number, y: number, text: string, fontSize = 7) => {
  commands.push(`BT /F1 ${fontSize} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
};

const buildPixelEyePdf = (rows: any[], fromDate: string, toDate: string): Blob => {
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 24;
  const rowHeight = 16;
  const topY = pageHeight - 82;
  const minY = 34;
  const pages: string[] = [];
  let commands: string[] = [];
  let y = topY;

  const drawHeader = () => {
    commands = [];
    addPdfText(commands, margin, pageHeight - 30, 'PixelEye Lead Report', 14);
    addPdfText(commands, margin, pageHeight - 48, `Date range: ${fromDate} to ${toDate}`, 8);
    addPdfText(commands, margin, pageHeight - 62, `Generated: ${new Date().toLocaleString()}`, 8);
    let x = margin;
    PIXELEYE_EXPORT_COLUMNS.forEach((column) => {
      addPdfText(commands, x, pageHeight - 78, column.label, 6.5);
      x += column.width;
    });
    commands.push(`${margin} ${pageHeight - 84} m ${pageWidth - margin} ${pageHeight - 84} l S`);
    y = topY;
  };

  const finishPage = () => {
    pages.push(commands.join('\n'));
  };

  drawHeader();
  rows.forEach((row) => {
    if (y < minY) {
      finishPage();
      drawHeader();
    }

    let x = margin;
    PIXELEYE_EXPORT_COLUMNS.forEach((column) => {
      const maxChars = Math.max(Math.floor(column.width / 4.2), 6);
      addPdfText(commands, x, y, truncateText(getLeadValue(row, column.key), maxChars) || '-', 6);
      x += column.width;
    });
    y -= rowHeight;
  });
  finishPage();

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  ];

  pages.forEach((content, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectId} 0 R >>`,
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
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
  const [exportFromDate, setExportFromDate] = useState(() => getTodayDateString());
  const [exportToDate, setExportToDate] = useState(() => getTodayDateString());
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportCsv = () => {
    const rows = getExportRows();
    if (!rows) return;

    setIsExporting(true);
    try {
      const csv = buildPixelEyeCsv(rows);
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${exportFileBaseName}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = () => {
    const rows = getExportRows();
    if (!rows) return;

    setIsExporting(true);
    try {
      const blob = buildPixelEyePdf(rows, exportFromDate, exportToDate);
      saveAs(blob, `${exportFileBaseName}.pdf`);
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
            <Button variant="outlined" onClick={handleExportCsv} disabled={isLoading || isExporting}>
              Export CSV
            </Button>
            <Button variant="outlined" onClick={handleExportPdf} disabled={isLoading || isExporting}>
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
    </Stack>
  );
};

export default DynamicSection;
