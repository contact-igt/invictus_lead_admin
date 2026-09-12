import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  useBirthwaveServicesQuery,
  useCreateBirthwaveServiceMutation,
  useReorderBirthwaveServicesMutation,
  useUpdateBirthwaveServiceMutation,
} from 'components/hooks/useBirthwaveQuery';
import { BirthwaveService } from 'services/birthwave';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from '../BirthwaveDrawerLayout';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

interface ServicesManagerProps {
  clientKey: string | undefined;
  canManage: boolean;
}

/**
 * BW-SVC-001 — the admin surface for the Birthwave service master.
 *
 * Services are what the website form, landing pages, manual Add Lead, Repli
 * normalisation, Lead filters and assignment rules all resolve against, so this
 * screen is the single place an administrator changes them — no code change and
 * no redeploy. Renaming is safe because everything references a service by id.
 *
 * There is deliberately no delete: a service may be referenced by historical
 * Leads and by routing rules, so it is deactivated instead (hidden from new
 * enquiries, still shown on the Leads that already carry it).
 */
const ServicesManager = ({ clientKey, canManage }: ServicesManagerProps) => {
  const { data: services = [], isLoading, isError, refetch } = useBirthwaveServicesQuery(clientKey);
  const createService = useCreateBirthwaveServiceMutation(clientKey);
  const updateService = useUpdateBirthwaveServiceMutation(clientKey);
  const reorderServices = useReorderBirthwaveServicesMutation(clientKey);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BirthwaveService | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('');

  const isSaving = createService.isLoading || updateService.isLoading;
  const mutationError = (createService.error || updateService.error || reorderServices.error) as
    | { response?: { data?: { message?: string } } }
    | null;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setIsActive(true);
    setSortOrder('');
    setOpen(true);
  };

  const openEdit = (service: BirthwaveService) => {
    setEditing(service);
    setName(service.name);
    setSlug(service.slug);
    setIsActive(service.is_active);
    setSortOrder(String(service.sort_order));
    setOpen(true);
  };

  const close = () => {
    if (!isSaving) setOpen(false);
  };

  const submit = () => {
    if (!name.trim()) return;
    const onSuccess = () => setOpen(false);
    const parsedSortOrder = sortOrder.trim() === '' ? undefined : Number(sortOrder);
    if (editing) {
      updateService.mutate(
        { id: editing.id, data: { name: name.trim(), slug: slug.trim() || undefined, is_active: isActive, sort_order: parsedSortOrder } },
        { onSuccess },
      );
    } else {
      createService.mutate({ name: name.trim(), slug: slug.trim() || undefined, is_active: isActive, sort_order: parsedSortOrder }, { onSuccess });
    }
  };

  // Reordering moves one row at a time and submits the full resulting order,
  // which is what the API expects.
  const move = (service: BirthwaveService, delta: number) => {
    const index = services.findIndex((row) => row.id === service.id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= services.length) return;
    const next = [...services];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    reorderServices.mutate(next.map((row) => row.id));
  };

  const toggleActive = (service: BirthwaveService) =>
    updateService.mutate({ id: service.id, data: { is_active: !service.is_active } });

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        mb={2}
      >
        <Box>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK }}>Services</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED }}>
            The single service list used by the website, landing pages, Add Lead, Repli and assignment rules.
            Renaming a service is safe — Leads and routing rules reference it by identity, not by name.
          </Typography>
        </Box>
        {canManage && <Button
          variant="contained"
          onClick={openCreate}
          startIcon={<Icon icon="mdi:plus" width={18} height={18} />}
          sx={{ textTransform: 'none', fontWeight: 700, bgcolor: GREEN, boxShadow: 'none', whiteSpace: 'nowrap' }}
        >
          Add Service
        </Button>}
      </Stack>

      {!canManage && <Alert severity="info" sx={{ mb: 2 }}>Services are read-only for your role. Birthwave administrators manage the service master.</Alert>}

      {mutationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mutationError.response?.data?.message || 'Unable to save this service.'}
        </Alert>
      )}

      <Box sx={{ border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px', overflowX: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED }}>Loading services…</Typography>
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED, mb: 1 }}>Unable to load services.</Typography>
            <Button size="small" onClick={() => refetch()} sx={{ textTransform: 'none', color: GREEN }}>Try again</Button>
          </Box>
        ) : services.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_MUTED }}>No services configured yet.</Typography>
          </Box>
        ) : (
          <Box component="table" sx={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr">
                {['Service Name', 'Slug', 'Status', 'Order', 'Actions'].map((heading) => (
                  <Box
                    component="th"
                    key={heading}
                    sx={{
                      textAlign: 'left',
                      px: 2,
                      py: 1.4,
                      color: TEXT_MUTED,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      borderBottom: '1px solid',
                      borderColor: CARD_BORDER,
                    }}
                  >
                    {heading}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {services.map((service, index) => (
                <Box component="tr" key={service.id} sx={{ '&:hover td': { bgcolor: 'var(--bw-hover)' } }}>
                  <Box component="td" sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: CARD_BORDER }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 700, color: TEXT_DARK, fontSize: '0.85rem' }}>{service.name}</Typography>
                      {service.is_system && (
                        <Tooltip title="Built-in fallback — a patient may choose this when they are not sure yet. It cannot be renamed away or deactivated.">
                          <Chip size="small" label="System" sx={{ fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                  <Box component="td" sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: CARD_BORDER, color: TEXT_MUTED, fontSize: '0.78rem' }}>
                    {service.slug}
                  </Box>
                  <Box component="td" sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: CARD_BORDER }}>
                    <Chip
                      size="small"
                      label={service.is_active ? 'Active' : 'Inactive'}
                      sx={{
                        fontWeight: 700,
                        bgcolor: service.is_active ? 'var(--bw-tint-green)' : 'var(--bw-surface-2)',
                        color: service.is_active ? '#15803D' : TEXT_MUTED,
                      }}
                    />
                  </Box>
                  <Box component="td" sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: CARD_BORDER }}>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton
                        size="small"
                        disabled={!canManage || index === 0 || reorderServices.isLoading}
                        onClick={() => move(service, -1)}
                        aria-label={`Move ${service.name} up`}
                      >
                        <Icon icon="mdi:arrow-up" width={16} height={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={!canManage || index === services.length - 1 || reorderServices.isLoading}
                        onClick={() => move(service, 1)}
                        aria-label={`Move ${service.name} down`}
                      >
                        <Icon icon="mdi:arrow-down" width={16} height={16} />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Box component="td" sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: CARD_BORDER }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                       {canManage && <Button size="small" onClick={() => openEdit(service)} sx={{ textTransform: 'none', color: GREEN, fontWeight: 700 }}>
                         Edit
                       </Button>}
                      {/* No delete: historical Leads and routing rules may reference this service. */}
                      <Tooltip
                        title={
                          service.is_system
                            ? 'The fallback service must stay available for new enquiries.'
                            : service.is_active
                              ? 'Hide from new enquiry forms. Existing Leads keep showing it.'
                              : 'Offer this service on new enquiry forms again.'
                        }
                      >
                        <span>
                          <Button
                            size="small"
                             disabled={!canManage || service.is_system || updateService.isLoading}
                            onClick={() => toggleActive(service)}
                            sx={{ textTransform: 'none', color: service.is_active ? '#B42318' : TEXT_DARK, fontWeight: 700 }}
                          >
                            {service.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <BirthwaveDrawerLayout
        open={open}
        onClose={close}
        title={editing ? 'Edit Service' : 'Add Service'}
        subtitle="Services drive every Birthwave lead form and routing rule"
        width={420}
        footer={
          <>
            <Button onClick={close} disabled={isSaving} sx={{ textTransform: 'none', color: TEXT_MUTED }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="birthwave-service-form"
              variant="contained"
              disabled={!name.trim() || isSaving}
              sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}
            >
              {isSaving ? 'Saving…' : editing ? 'Save Changes' : 'Add Service'}
            </Button>
          </>
        }
      >
        <Box
          id="birthwave-service-form"
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          noValidate
        >
          {editing && (
              <Alert severity="info">
                Renaming this service updates it everywhere immediately. Existing Leads, filters, routing
                rules and history are unaffected.
              </Alert>
          )}
          <BirthwaveFormGrid>
            <BirthwaveFormGridItem><TextField
              required
              fullWidth
              label="Service name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              helperText="Shown to patients on the website form and to staff in the CRM."
            /></BirthwaveFormGridItem>
            <BirthwaveFormGridItem><TextField
              fullWidth
              label="Slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              disabled={Boolean(editing?.is_system)}
              helperText={
                editing?.is_system
                  ? 'The fallback service keeps a fixed slug.'
                  : 'Stable identifier used by landing pages and provider mapping. Leave empty to generate it from the name.'
              }
            /></BirthwaveFormGridItem>
            <BirthwaveFormGridItem><TextField
              fullWidth
              type="number"
              label="Sort order"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              inputProps={{ min: 0, step: 1 }}
              helperText="Lower numbers appear first. Leave empty to place a new service at the end."
            /></BirthwaveFormGridItem>
            <BirthwaveFormGridItem sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  disabled={Boolean(editing?.is_system)}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
              }
              label="Available for new enquiries"
              />
            </BirthwaveFormGridItem>
          </BirthwaveFormGrid>
        </Box>
      </BirthwaveDrawerLayout>
    </Box>
  );
};

export default ServicesManager;
