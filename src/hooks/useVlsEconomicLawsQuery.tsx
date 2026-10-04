import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsEconomicLawsRegistration,
  deleteVlsEconomicLawsRegistration,
  getVlsEconomicLawsRegistrationById,
  getVlsEconomicLawsRegistrations,
  getVlsEconomicLawsSummary,
  updateVlsEconomicLawsRegistration,
} from 'services/vlsEconomicLaws.service';
import {
  getVlsEconomicLawsErrorMessage,
  getVlsEconomicLawsErrorStatus,
} from 'components/sections/vls-economic-laws/vlsEconomicLawsUtils';
import type {
  CreateVlsEconomicLawsPayload,
  UpdateVlsEconomicLawsPayload,
  VlsEconomicLawsDeleteResponse,
  VlsEconomicLawsExportParams,
  VlsEconomicLawsListParams,
  VlsEconomicLawsListResponse,
  VlsEconomicLawsResponse,
  VlsEconomicLawsSummaryResponse,
} from 'types/vlsEconomicLaws';

export const vlsEconomicLawsKeys = {
  all: ['vls-economic-laws'] as const,
  lists: () => [...vlsEconomicLawsKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...vlsEconomicLawsKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsEconomicLawsListParams) =>
    [...vlsEconomicLawsKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsEconomicLawsExportParams) =>
    [...vlsEconomicLawsKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsEconomicLawsKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) => [...vlsEconomicLawsKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsEconomicLawsErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsEconomicLawsRegistrations = (
  clientKey: string | undefined,
  params: VlsEconomicLawsListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsEconomicLawsListResponse, unknown>(
    vlsEconomicLawsKeys.list(clientKey, params),
    () => getVlsEconomicLawsRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsEconomicLawsSummary = (
  clientKey: string | undefined,
  params: VlsEconomicLawsExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsEconomicLawsSummaryResponse, unknown>(
    vlsEconomicLawsKeys.summary(clientKey, params),
    () => getVlsEconomicLawsSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsEconomicLawsRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsEconomicLawsResponse, unknown>(
    vlsEconomicLawsKeys.detail(clientKey, id ?? 0),
    () => getVlsEconomicLawsRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsEconomicLawsRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsEconomicLawsResponse, unknown, CreateVlsEconomicLawsPayload>(
    (payload) => createVlsEconomicLawsRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Economic Laws & Practice registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsEconomicLawsKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsEconomicLawsKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsEconomicLawsErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsEconomicLawsPayload;
}

export const useUpdateVlsEconomicLawsRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsEconomicLawsResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsEconomicLawsRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Economic Laws & Practice registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsEconomicLawsKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsEconomicLawsKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsEconomicLawsKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsEconomicLawsErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsEconomicLawsRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsEconomicLawsDeleteResponse, unknown, number>(
    (id) => deleteVlsEconomicLawsRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Economic Laws & Practice registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsEconomicLawsKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsEconomicLawsKeys.summary(clientKey));
        queryClient.removeQueries(vlsEconomicLawsKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsEconomicLawsErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};
