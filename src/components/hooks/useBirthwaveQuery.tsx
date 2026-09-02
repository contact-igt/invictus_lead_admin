import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import {
  BirthwaveApis,
  BirthwaveAppointment,
  BirthwaveDashboard,
  BirthwaveDoctor,
  BirthwaveLead,
  BirthwaveLeadActivity,
  BirthwaveWebsiteLead,
  BirthwaveWebsiteSourceCount,
} from 'services/birthwave';

interface ErrorPayload {
  message?: string;
}

const errorMessage = (error: unknown, fallback: string) =>
  (error as AxiosError<ErrorPayload>)?.response?.data?.message || fallback;

// ── Dashboard ────────────────────────────────────────────────────────────
export const useBirthwaveDashboardQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveDashboard>(
    ['birthwave-dashboard', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getDashboard(clientKey, params);
      return res.data as BirthwaveDashboard;
    },
    { enabled: options.enabled ?? true },
  );

// ── Leads ────────────────────────────────────────────────────────────────
export const useBirthwaveLeadsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<{ data: BirthwaveLead[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['birthwave-leads', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getLeads(clientKey, params);
      return res as { data: BirthwaveLead[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

export const useBirthwaveLeadDetailQuery = (
  clientKey: string | undefined,
  leadId: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveLead>(
    ['birthwave-lead-detail', clientKey, leadId],
    async () => {
      const res = await BirthwaveApis.getLead(clientKey, leadId as string);
      return res.data as BirthwaveLead;
    },
    { enabled: (options.enabled ?? true) && Boolean(leadId) },
  );

export const useBirthwaveLeadTimelineQuery = (
  clientKey: string | undefined,
  leadId: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveLeadActivity[]>(
    ['birthwave-lead-timeline', clientKey, leadId],
    async () => {
      const res = await BirthwaveApis.getLeadTimeline(clientKey, leadId as string);
      return (res?.data ?? []) as BirthwaveLeadActivity[];
    },
    { enabled: (options.enabled ?? true) && Boolean(leadId) },
  );

export const useCreateBirthwaveLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<BirthwaveLead>) => BirthwaveApis.createLead(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Lead added successfully', { variant: 'success' });
      qc.invalidateQueries(['birthwave-leads']);
      qc.invalidateQueries(['birthwave-dashboard']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to add lead'), { variant: 'error' });
    },
  });
};

export const useUpdateBirthwaveLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveLead> }) =>
      BirthwaveApis.updateLead(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Lead updated successfully', { variant: 'success' });
        qc.invalidateQueries(['birthwave-leads']);
        qc.invalidateQueries(['birthwave-dashboard']);
      },
      onError: (error) => {

        enqueueSnackbar(errorMessage(error, 'Failed to update lead'), { variant: 'error' });

      },
    },
  );
};

// ── Doctors ──────────────────────────────────────────────────────────────
export const useBirthwaveDoctorsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveDoctor[]>(
    ['birthwave-doctors', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getDoctors(clientKey, params);
      return (res?.data ?? []) as BirthwaveDoctor[];
    },
    { enabled: options.enabled ?? true },
  );

export const useCreateBirthwaveDoctorMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<BirthwaveDoctor>) => BirthwaveApis.createDoctor(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Doctor added successfully', { variant: 'success' });
      qc.invalidateQueries(['birthwave-doctors']);
    },
    onError: (error) => {

      enqueueSnackbar(errorMessage(error, 'Failed to add doctor'), { variant: 'error' });

    },
  });
};

export const useUpdateBirthwaveDoctorMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveDoctor> }) =>
      BirthwaveApis.updateDoctor(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Doctor updated successfully', { variant: 'success' });
        qc.invalidateQueries(['birthwave-doctors']);
      },
      onError: (error) => {

        enqueueSnackbar(errorMessage(error, 'Failed to update doctor'), { variant: 'error' });

      },
    },
  );
};

// ── Appointments ─────────────────────────────────────────────────────────
export const useBirthwaveAppointmentsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<{ data: BirthwaveAppointment[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['birthwave-appointments', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getAppointments(clientKey, params);
      return res as { data: BirthwaveAppointment[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

export const useCreateBirthwaveAppointmentMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<BirthwaveAppointment>) => BirthwaveApis.createAppointment(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Appointment created successfully', { variant: 'success' });
      qc.invalidateQueries(['birthwave-appointments']);
      qc.invalidateQueries(['birthwave-dashboard']);
    },
    onError: (error) => {

      enqueueSnackbar(errorMessage(error, 'Failed to create appointment'), { variant: 'error' });

    },
  });
};

export const useUpdateBirthwaveAppointmentMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveAppointment> }) =>
      BirthwaveApis.updateAppointment(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Appointment updated successfully', { variant: 'success' });
        qc.invalidateQueries(['birthwave-appointments']);
        qc.invalidateQueries(['birthwave-dashboard']);
      },
      onError: (error) => {

        enqueueSnackbar(errorMessage(error, 'Failed to update appointment'), { variant: 'error' });

      },
    },
  );
};

// ── Website / landing-page enquiries ─────────────────────────────────────
interface WebsiteLeadPage {
  data: BirthwaveWebsiteLead[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const useBirthwaveWebsiteLeadsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<WebsiteLeadPage>(
    ['birthwave-website-leads', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getWebsiteLeads(clientKey, params);
      return res as WebsiteLeadPage;
    },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

export const useBirthwaveWebsiteLeadSourcesQuery = (
  clientKey: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveWebsiteSourceCount[]>(
    ['birthwave-website-lead-sources', clientKey],
    async () => {
      const res = await BirthwaveApis.getWebsiteLeadSources(clientKey);
      return (res?.data ?? []) as BirthwaveWebsiteSourceCount[];
    },
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveWebsiteLeadQuery = (
  clientKey: string | undefined,
  id: number | string | null,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveWebsiteLead>(
    ['birthwave-website-lead', clientKey, id],
    async () => {
      const res = await BirthwaveApis.getWebsiteLead(clientKey, id as number);
      return res.data as BirthwaveWebsiteLead;
    },
    { enabled: (options.enabled ?? true) && Boolean(id) },
  );

export const useUpdateBirthwaveWebsiteLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: { status?: string; notes?: string | null } }) =>
      BirthwaveApis.updateWebsiteLead(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Enquiry updated', { variant: 'success' });
        qc.invalidateQueries(['birthwave-website-leads']);
        qc.invalidateQueries(['birthwave-website-lead']);
        qc.invalidateQueries(['birthwave-website-lead-sources']);
      },
      onError: (error) => {
        enqueueSnackbar(errorMessage(error, 'Failed to update enquiry'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteBirthwaveWebsiteLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number | string) => BirthwaveApis.deleteWebsiteLead(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Enquiry deleted', { variant: 'success' });
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead-sources']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to delete enquiry'), { variant: 'error' });
    },
  });
};

export const usePromoteBirthwaveWebsiteLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number | string) => BirthwaveApis.promoteWebsiteLead(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Enquiry promoted to a CRM lead', { variant: 'success' });
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead']);
      qc.invalidateQueries(['birthwave-leads']);
      qc.invalidateQueries(['birthwave-dashboard']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to promote enquiry'), { variant: 'error' });
    },
  });
};

export const useRetryBirthwaveWebsiteLeadSheetSyncMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number | string) => BirthwaveApis.retryWebsiteLeadSheetSync(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Google Sheet sync retried', { variant: 'success' });
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to retry sheet sync'), { variant: 'error' });
    },
  });
};

export const useRetryFailedBirthwaveWebsiteLeadSheetSyncsMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((sourceKey?: string) => BirthwaveApis.retryFailedWebsiteLeadSheetSyncs(clientKey, sourceKey), {
    onSuccess: (res: unknown) => {
      const r = res as { requeued?: number; synced?: number };
      enqueueSnackbar(
        `Re-queued ${r.requeued ?? 0} sync${(r.requeued ?? 0) === 1 ? '' : 's'}` +
          (r.synced ? ` · ${r.synced} synced now` : ''),
        { variant: 'success' },
      );
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to re-queue sheet syncs'), { variant: 'error' });
    },
  });
};
