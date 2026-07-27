import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsConsumerProtectionLawMasterClassRegistration,
  deleteVlsConsumerProtectionLawMasterClassRegistration,
  getVlsConsumerProtectionLawMasterClassRegistrationById,
  getVlsConsumerProtectionLawMasterClassRegistrations,
  getVlsConsumerProtectionLawMasterClassSummary,
  updateVlsConsumerProtectionLawMasterClassRegistration,
} from 'services/vlsConsumerProtectionLawMasterClass.service';
import {
  getVlsConsumerProtectionLawErrorMessage,
  getVlsConsumerProtectionLawErrorStatus,
} from 'components/sections/vls-consumer-protection-law-master-class/vlsConsumerProtectionLawMasterClassUtils';
import type {
  CreateVlsConsumerProtectionLawMasterClassPayload,
  UpdateVlsConsumerProtectionLawMasterClassPayload,
  VlsConsumerProtectionLawMasterClassDeleteResponse,
  VlsConsumerProtectionLawMasterClassExportParams,
  VlsConsumerProtectionLawMasterClassListParams,
  VlsConsumerProtectionLawMasterClassListResponse,
  VlsConsumerProtectionLawMasterClassResponse,
  VlsConsumerProtectionLawMasterClassSummaryResponse,
} from 'types/vlsConsumerProtectionLawMasterClass';

export const vlsConsumerProtectionLawMasterClassKeys = {
  all: ['vls-consumer-protection-law-master-class'] as const,
  lists: () => [...vlsConsumerProtectionLawMasterClassKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) =>
    [...vlsConsumerProtectionLawMasterClassKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsConsumerProtectionLawMasterClassListParams) =>
    [...vlsConsumerProtectionLawMasterClassKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsConsumerProtectionLawMasterClassExportParams) =>
    [...vlsConsumerProtectionLawMasterClassKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsConsumerProtectionLawMasterClassKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...vlsConsumerProtectionLawMasterClassKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsConsumerProtectionLawErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsConsumerProtectionLawMasterClassRegistrations = (
  clientKey: string | undefined,
  params: VlsConsumerProtectionLawMasterClassListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsConsumerProtectionLawMasterClassListResponse, unknown>(
    vlsConsumerProtectionLawMasterClassKeys.list(clientKey, params),
    () => getVlsConsumerProtectionLawMasterClassRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsConsumerProtectionLawMasterClassSummary = (
  clientKey: string | undefined,
  params: VlsConsumerProtectionLawMasterClassExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsConsumerProtectionLawMasterClassSummaryResponse, unknown>(
    vlsConsumerProtectionLawMasterClassKeys.summary(clientKey, params),
    () => getVlsConsumerProtectionLawMasterClassSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsConsumerProtectionLawMasterClassRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsConsumerProtectionLawMasterClassResponse, unknown>(
    vlsConsumerProtectionLawMasterClassKeys.detail(clientKey, id ?? 0),
    () => getVlsConsumerProtectionLawMasterClassRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsConsumerProtectionLawMasterClassRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsConsumerProtectionLawMasterClassResponse, unknown, CreateVlsConsumerProtectionLawMasterClassPayload>(
    (payload) => createVlsConsumerProtectionLawMasterClassRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Consumer Protection Law Masterclass registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsConsumerProtectionLawErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsConsumerProtectionLawMasterClassPayload;
}

export const useUpdateVlsConsumerProtectionLawMasterClassRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsConsumerProtectionLawMasterClassResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsConsumerProtectionLawMasterClassRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Consumer Protection Law Masterclass registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsConsumerProtectionLawErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsConsumerProtectionLawMasterClassRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsConsumerProtectionLawMasterClassDeleteResponse, unknown, number>(
    (id) => deleteVlsConsumerProtectionLawMasterClassRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Consumer Protection Law Masterclass registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsConsumerProtectionLawMasterClassKeys.summary(clientKey));
        queryClient.removeQueries(vlsConsumerProtectionLawMasterClassKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsConsumerProtectionLawErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};
