import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsMactMasterClassRegistration,
  deleteVlsMactMasterClassRegistration,
  getVlsMactMasterClassRegistrationById,
  getVlsMactMasterClassRegistrations,
  getVlsMactMasterClassSummary,
  updateVlsMactMasterClassRegistration,
} from 'services/vlsMactMasterClass.service';
import {
  getVlsMactErrorMessage,
  getVlsMactErrorStatus,
} from 'components/sections/vls-mact-master-class/vlsMactMasterClassUtils';
import type {
  CreateVlsMactMasterClassPayload,
  UpdateVlsMactMasterClassPayload,
  VlsMactMasterClassDeleteResponse,
  VlsMactMasterClassExportParams,
  VlsMactMasterClassListParams,
  VlsMactMasterClassListResponse,
  VlsMactMasterClassResponse,
  VlsMactMasterClassSummaryResponse,
} from 'types/vlsMactMasterClass';

export const vlsMactMasterClassKeys = {
  all: ['vls-mact-master-class'] as const,
  lists: () => [...vlsMactMasterClassKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...vlsMactMasterClassKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsMactMasterClassListParams) =>
    [...vlsMactMasterClassKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsMactMasterClassExportParams) =>
    [...vlsMactMasterClassKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsMactMasterClassKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) => [...vlsMactMasterClassKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsMactErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsMactMasterClassRegistrations = (
  clientKey: string | undefined,
  params: VlsMactMasterClassListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsMactMasterClassListResponse, unknown>(
    vlsMactMasterClassKeys.list(clientKey, params),
    () => getVlsMactMasterClassRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsMactMasterClassSummary = (
  clientKey: string | undefined,
  params: VlsMactMasterClassExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsMactMasterClassSummaryResponse, unknown>(
    vlsMactMasterClassKeys.summary(clientKey, params),
    () => getVlsMactMasterClassSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsMactMasterClassRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsMactMasterClassResponse, unknown>(
    vlsMactMasterClassKeys.detail(clientKey, id ?? 0),
    () => getVlsMactMasterClassRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsMactMasterClassRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsMactMasterClassResponse, unknown, CreateVlsMactMasterClassPayload>(
    (payload) => createVlsMactMasterClassRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('MACT Master Class registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsMactMasterClassKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsMactMasterClassKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsMactErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsMactMasterClassPayload;
}

export const useUpdateVlsMactMasterClassRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsMactMasterClassResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsMactMasterClassRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('MACT Master Class registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsMactMasterClassKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsMactMasterClassKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsMactMasterClassKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsMactErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsMactMasterClassRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsMactMasterClassDeleteResponse, unknown, number>(
    (id) => deleteVlsMactMasterClassRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('MACT Master Class registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsMactMasterClassKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsMactMasterClassKeys.summary(clientKey));
        queryClient.removeQueries(vlsMactMasterClassKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsMactErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};

