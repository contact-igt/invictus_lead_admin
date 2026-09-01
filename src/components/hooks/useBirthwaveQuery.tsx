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
