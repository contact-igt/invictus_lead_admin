import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsBusinessLawRegistration,
  deleteVlsBusinessLawRegistration,
  getVlsBusinessLawRegistrationById,
  getVlsBusinessLawRegistrations,
  getVlsBusinessLawSummary,
  updateVlsBusinessLawRegistration,
} from 'services/vlsBusinessLaw.service';
import {
  getVlsBusinessLawErrorMessage,
  getVlsBusinessLawErrorStatus,
} from 'components/sections/vls-business-law/vlsBusinessLawUtils';
import type {
  CreateVlsBusinessLawPayload,
  UpdateVlsBusinessLawPayload,
  VlsBusinessLawDeleteResponse,
  VlsBusinessLawExportParams,
  VlsBusinessLawListParams,
  VlsBusinessLawListResponse,
  VlsBusinessLawResponse,
  VlsBusinessLawSummaryResponse,
} from 'types/vlsBusinessLaw';

export const vlsBusinessLawKeys = {
  all: ['vls-business-law'] as const,
  lists: () => [...vlsBusinessLawKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...vlsBusinessLawKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsBusinessLawListParams) =>
    [...vlsBusinessLawKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsBusinessLawExportParams) =>
    [...vlsBusinessLawKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsBusinessLawKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) => [...vlsBusinessLawKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsBusinessLawErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsBusinessLawRegistrations = (
  clientKey: string | undefined,
  params: VlsBusinessLawListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsBusinessLawListResponse, unknown>(
    vlsBusinessLawKeys.list(clientKey, params),
    () => getVlsBusinessLawRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsBusinessLawSummary = (
  clientKey: string | undefined,
  params: VlsBusinessLawExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsBusinessLawSummaryResponse, unknown>(
    vlsBusinessLawKeys.summary(clientKey, params),
    () => getVlsBusinessLawSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsBusinessLawRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsBusinessLawResponse, unknown>(
    vlsBusinessLawKeys.detail(clientKey, id ?? 0),
    () => getVlsBusinessLawRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsBusinessLawRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsBusinessLawResponse, unknown, CreateVlsBusinessLawPayload>(
    (payload) => createVlsBusinessLawRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Business Law registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsBusinessLawKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsBusinessLawKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsBusinessLawErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsBusinessLawPayload;
}

export const useUpdateVlsBusinessLawRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsBusinessLawResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsBusinessLawRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Business Law registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsBusinessLawKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsBusinessLawKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsBusinessLawKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsBusinessLawErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsBusinessLawRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsBusinessLawDeleteResponse, unknown, number>(
    (id) => deleteVlsBusinessLawRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Business Law registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsBusinessLawKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsBusinessLawKeys.summary(clientKey));
        queryClient.removeQueries(vlsBusinessLawKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsBusinessLawErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};
