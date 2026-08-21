import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsLawPracticeRegistration,
  deleteVlsLawPracticeRegistration,
  getVlsLawPracticeRegistrationById,
  getVlsLawPracticeRegistrations,
  getVlsLawPracticeSummary,
  updateVlsLawPracticeRegistration,
} from 'services/vlsLawPractice.service';
import {
  getVlsLawPracticeErrorMessage,
  getVlsLawPracticeErrorStatus,
} from 'components/sections/vls-law-practice/vlsLawPracticeUtils';
import type {
  CreateVlsLawPracticePayload,
  UpdateVlsLawPracticePayload,
  VlsLawPracticeDeleteResponse,
  VlsLawPracticeExportParams,
  VlsLawPracticeListParams,
  VlsLawPracticeListResponse,
  VlsLawPracticeResponse,
  VlsLawPracticeSummaryResponse,
} from 'types/vlsLawPractice';

export const vlsLawPracticeKeys = {
  all: ['vls-law-practice'] as const,
  lists: () => [...vlsLawPracticeKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...vlsLawPracticeKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsLawPracticeListParams) =>
    [...vlsLawPracticeKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsLawPracticeExportParams) =>
    [...vlsLawPracticeKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsLawPracticeKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) => [...vlsLawPracticeKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsLawPracticeErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsLawPracticeRegistrations = (
  clientKey: string | undefined,
  params: VlsLawPracticeListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsLawPracticeListResponse, unknown>(
    vlsLawPracticeKeys.list(clientKey, params),
    () => getVlsLawPracticeRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsLawPracticeSummary = (
  clientKey: string | undefined,
  params: VlsLawPracticeExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsLawPracticeSummaryResponse, unknown>(
    vlsLawPracticeKeys.summary(clientKey, params),
    () => getVlsLawPracticeSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsLawPracticeRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsLawPracticeResponse, unknown>(
    vlsLawPracticeKeys.detail(clientKey, id ?? 0),
    () => getVlsLawPracticeRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsLawPracticeRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsLawPracticeResponse, unknown, CreateVlsLawPracticePayload>(
    (payload) => createVlsLawPracticeRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Law Practice registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsLawPracticeKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsLawPracticeKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsLawPracticeErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsLawPracticePayload;
}

export const useUpdateVlsLawPracticeRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsLawPracticeResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsLawPracticeRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Law Practice registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsLawPracticeKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsLawPracticeKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsLawPracticeKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsLawPracticeErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsLawPracticeRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsLawPracticeDeleteResponse, unknown, number>(
    (id) => deleteVlsLawPracticeRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Law Practice registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsLawPracticeKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsLawPracticeKeys.summary(clientKey));
        queryClient.removeQueries(vlsLawPracticeKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsLawPracticeErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};
