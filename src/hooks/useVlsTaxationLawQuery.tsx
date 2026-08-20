import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsTaxationLawRegistration,
  deleteVlsTaxationLawRegistration,
  getVlsTaxationLawRegistrationById,
  getVlsTaxationLawRegistrations,
  getVlsTaxationLawSummary,
  updateVlsTaxationLawRegistration,
} from 'services/vlsTaxationLaw.service';
import {
  getVlsTaxationLawErrorMessage,
  getVlsTaxationLawErrorStatus,
} from 'components/sections/vls-taxation-law/vlsTaxationLawUtils';
import type {
  CreateVlsTaxationLawPayload,
  UpdateVlsTaxationLawPayload,
  VlsTaxationLawDeleteResponse,
  VlsTaxationLawExportParams,
  VlsTaxationLawListParams,
  VlsTaxationLawListResponse,
  VlsTaxationLawResponse,
  VlsTaxationLawSummaryResponse,
} from 'types/vlsTaxationLaw';

export const vlsTaxationLawKeys = {
  all: ['vls-taxation-law'] as const,
  lists: () => [...vlsTaxationLawKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...vlsTaxationLawKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsTaxationLawListParams) =>
    [...vlsTaxationLawKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsTaxationLawExportParams) =>
    [...vlsTaxationLawKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsTaxationLawKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) => [...vlsTaxationLawKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsTaxationLawErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsTaxationLawRegistrations = (
  clientKey: string | undefined,
  params: VlsTaxationLawListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsTaxationLawListResponse, unknown>(
    vlsTaxationLawKeys.list(clientKey, params),
    () => getVlsTaxationLawRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsTaxationLawSummary = (
  clientKey: string | undefined,
  params: VlsTaxationLawExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsTaxationLawSummaryResponse, unknown>(
    vlsTaxationLawKeys.summary(clientKey, params),
    () => getVlsTaxationLawSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsTaxationLawRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsTaxationLawResponse, unknown>(
    vlsTaxationLawKeys.detail(clientKey, id ?? 0),
    () => getVlsTaxationLawRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsTaxationLawRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsTaxationLawResponse, unknown, CreateVlsTaxationLawPayload>(
    (payload) => createVlsTaxationLawRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Taxation Law registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsTaxationLawKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsTaxationLawKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsTaxationLawErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsTaxationLawPayload;
}

export const useUpdateVlsTaxationLawRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsTaxationLawResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsTaxationLawRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Taxation Law registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsTaxationLawKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsTaxationLawKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsTaxationLawKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsTaxationLawErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsTaxationLawRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsTaxationLawDeleteResponse, unknown, number>(
    (id) => deleteVlsTaxationLawRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Taxation Law registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsTaxationLawKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsTaxationLawKeys.summary(clientKey));
        queryClient.removeQueries(vlsTaxationLawKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsTaxationLawErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};
