import {
  usePixelEyeQuery,
  useCreatePixelEyeMutation,
  useUpdatePixelEyeMutation,
  useDeletePixelEyeMutation,
  CreatePixelEyePayload,
  UpdatePixelEyePayload,
} from 'components/hooks/usePixelEyeQuery';
import PixelEyeTable, { PixelEyeRow } from './pixelEyeTable';
import PixelEyeLeadDrawer, { PixelEyeLeadFormValues } from './PixelEyeLeadDrawer';
import PixelEyeDeleteDrawer from './PixelEyeDeleteDrawer';
import PageLoader from 'components/loader/PageLoader';
import Button from '@mui/material/Button';
import { useState, useMemo } from 'react';
import { Box, MenuItem, InputAdornment, Stack } from '@mui/material';
import { ALL_STATUSES } from './pixelEyeStatuses';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeClientKey } from 'utils/clientKey';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import useColorMode from 'hooks/useColorMode';
import { Search, Download, Plus } from 'lucide-react';
import {
  PixelEyeCard,
  PixelEyePageHeader,
  PixelEyePageShell,
  getPixelEyeButtonSx,
} from './pixelEyeUi';
import PixelEyeDatePicker from './PixelEyeDatePicker';
import PixelEyeField from './PixelEyeField';

const ENABLE_PIXEL_EYE_LEAD_DETAIL_NAVIGATION = true;

const EXPORT_COLUMNS: Array<{ key: keyof PixelEyeRow; label: string; width: number }> = [
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
];

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

const getLeadValue = (lead: PixelEyeRow, key: keyof PixelEyeRow): string => {
  if (key === 'createdAt') {
    return String(lead.createdAt || lead.created_at || '');
  }
  if (key === 'updatedAt') {
    return String(lead.updatedAt || lead.updated_at || '');
  }
  return String(lead[key] ?? '');
};

const escapeCsvValue = (value: string): string => {
  const text = value.replace(/\r?\n|\r/g, ' ').trim();
  return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildCsv = (rows: PixelEyeRow[]): string => {
  const header = EXPORT_COLUMNS.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows.map((row) =>
    EXPORT_COLUMNS.map((column) => escapeCsvValue(getLeadValue(row, column.key))).join(','),
  );
  return [header, ...body].join('\n');
};

const escapePdfText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n|\r/g, ' ');

const truncateText = (value: string, maxChars: number): string => {
  const text = String(value || '').trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(maxChars - 3, 0))}...`;
};

const addPdfText = (commands: string[], x: number, y: number, text: string, fontSize = 7) => {
  commands.push(`BT /F1 ${fontSize} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
};

const buildSimplePdf = (rows: PixelEyeRow[], fromDate: string, toDate: string): Blob => {
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
    EXPORT_COLUMNS.forEach((column) => {
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
    EXPORT_COLUMNS.forEach((column) => {
      const maxChars = Math.max(Math.floor(column.width / 4.2), 6);
      const value = truncateText(getLeadValue(row, column.key), maxChars);
      addPdfText(commands, x, y, value || '-', 6);
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

const getMutationErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

const PixelEyeSection = () => {
  const { mode } = useColorMode();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();
  const createMutation = useCreatePixelEyeMutation();
  const updateMutation = useUpdatePixelEyeMutation();
  const deleteMutation = useDeletePixelEyeMutation();

  const activeClientKey = normalizeClientKey(
    user?.role === 'super-admin' ? urlClientKey || 'pixeleye' : user?.clientKey,
  );

  const { data: leads = [], isLoading } = usePixelEyeQuery(
    user?.role === 'super-admin' ? activeClientKey : undefined,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<PixelEyeRow | null>(null);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<PixelEyeRow | null>(null);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleAdd = () => {
    setEditRow(null);
    setFormOpen(true);
  };

  const handleEdit = (row: PixelEyeRow) => {
    setEditRow(row);
    setFormOpen(true);
  };

  const handleOpenLeadDetail = (row: PixelEyeRow) => {
    navigate(`/pixel-eye/leads/${row.id}`);
  };

  const handleInlineStatusChange = (id: number, value: string) => {
    updateMutation.mutate(
      { id, status: value },
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
    updateMutation.mutate(
      {
        id,
        [day]: value,
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

  const handleOpenDeleteDrawer = (row: PixelEyeRow) => {
    setDeleteRow(row);
    setDeleteDrawerOpen(true);
  };

  const handleDelete = () => {
    if (!deleteRow?.id) return;

    deleteMutation.mutate(deleteRow.id, {
      onSuccess: () => {
        setDeleteDrawerOpen(false);
        setDeleteRow(null);
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

  const buildLeadPayload = (values: PixelEyeLeadFormValues): PixelEyeLeadFormValues => {
    const payload = { ...values };
    if (!String(payload.follow_up_date || '').trim()) {
      delete payload.follow_up_date;
    }
    (['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const).forEach((day) => {
      if (!String(payload[day] || '').trim()) {
        delete payload[day];
      }
    });
    return payload;
  };

  const handleFormSubmit = (values: PixelEyeLeadFormValues) => {
    const leadPayload = buildLeadPayload(values);

    if (editRow && editRow.id) {
      // Close only after the API call succeeds so the user sees errors if it fails.
      updateMutation.mutate({ id: editRow.id, ...leadPayload } as UpdatePixelEyePayload, {
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
        onSuccess: closeForm,
        onError: (error: any) => {
          enqueueSnackbar(getMutationErrorMessage(error, 'Failed to create lead'), {
            variant: 'error',
          });
        },
      });
    }
  };

  const handleFormCancel = closeForm;

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

  const exportFileBaseName = `pixel-eye-leads-${exportFromDate}-to-${exportToDate}`;

  const handleExportCsv = () => {
    const rows = getExportRows();
    if (!rows) return;

    setIsExporting(true);
    try {
      const csv = buildCsv(rows);
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
      const blob = buildSimplePdf(rows, exportFromDate, exportToDate);
      saveAs(blob, `${exportFileBaseName}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

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

      <PixelEyeCard sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          sx={{ p: { xs: 2.5, md: 3 } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            flex={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
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
              sx={{
                minWidth: { xs: '100%', sm: 280 },
              }}
            />
            <PixelEyeField
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 200 },
              }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </PixelEyeField>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
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
            />
            <PixelEyeDatePicker
              label="To"
              value={exportToDate}
              minDate={exportFromDate || undefined}
              disabled={!exportFromDate}
              onChange={(newTo) => setExportToDate(newTo)}
              fullWidth={false}
            />

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: 'space-between', sm: 'flex-start' }}
            >
              {(exportFromDate || exportToDate) && (
                <Button
                  variant="text"
                  onClick={() => {
                    setExportFromDate('');
                    setExportToDate('');
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '12px',
                    color: mode === 'dark' ? '#86EFAC' : '#156A45',
                    px: 1.5,
                  }}
                >
                  Reset
                </Button>
              )}

              <Box
                sx={{
                  borderLeft:
                    mode === 'dark'
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(0,0,0,0.1)',
                  height: 24,
                  mx: 1,
                  display: { xs: 'none', sm: 'block' },
                }}
              />

              <Button
                variant="outlined"
                onClick={handleExportCsv}
                disabled={isLoading || isExporting}
                startIcon={<Download size={16} />}
                sx={{
                  ...getPixelEyeButtonSx(mode, 'secondary'),
                  height: 46,
                  px: 2,
                  borderRadius: '14px',
                }}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                onClick={handleExportPdf}
                disabled={isLoading || isExporting}
                startIcon={<Download size={16} />}
                sx={{
                  ...getPixelEyeButtonSx(mode, 'secondary'),
                  height: 46,
                  px: 2,
                  borderRadius: '14px',
                }}
              >
                PDF
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </PixelEyeCard>

      <PixelEyeCard sx={{ overflow: 'hidden', borderRadius: '22px' }}>
        <PixelEyeTable
          rows={filteredLeads}
          onEdit={handleEdit}
          onDelete={handleOpenDeleteDrawer}
          onStatusChange={handleInlineStatusChange}
          onDayChange={handleInlineDayChange}
          onFollowUpDateChange={handleInlineFollowUpDateChange}
          onRowClick={ENABLE_PIXEL_EYE_LEAD_DETAIL_NAVIGATION ? handleOpenLeadDetail : undefined}
        />
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
