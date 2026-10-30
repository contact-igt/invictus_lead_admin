import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createVlsConstitutionalBootcampRegistration,
  deleteVlsConstitutionalBootcampRegistration,
  getVlsConstitutionalBootcampRegistrationById,
  getVlsConstitutionalBootcampRegistrations,
  getVlsConstitutionalBootcampSummary,
  updateVlsConstitutionalBootcampRegistration,
} from 'services/vlsConstitutionalBootcamp.service';
import {
  getVlsConstitutionalErrorMessage,
  getVlsConstitutionalErrorStatus,
} from 'components/sections/vls-constitutional-bootcamp/vlsConstitutionalBootcampUtils';
import type {
  CreateVlsConstitutionalBootcampPayload,
  UpdateVlsConstitutionalBootcampPayload,
  VlsConstitutionalBootcampDeleteResponse,
  VlsConstitutionalBootcampExportParams,
  VlsConstitutionalBootcampListParams,
  VlsConstitutionalBootcampListResponse,
  VlsConstitutionalBootcampResponse,
  VlsConstitutionalBootcampSummaryResponse,
} from 'types/vlsConstitutionalBootcamp';

export const vlsConstitutionalBootcampKeys = {
  all: ['vls-constitutional-bootcamp'] as const,
  lists: () => [...vlsConstitutionalBootcampKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...vlsConstitutionalBootcampKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: VlsConstitutionalBootcampListParams) =>
    [...vlsConstitutionalBootcampKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: VlsConstitutionalBootcampExportParams) =>
    [...vlsConstitutionalBootcampKeys.all, 'summary', clientKey, params] as const,
  details: () => [...vlsConstitutionalBootcampKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) => [...vlsConstitutionalBootcampKeys.details(), clientKey, id] as const,
};

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  const status = getVlsConstitutionalErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useVlsConstitutionalBootcampRegistrations = (
  clientKey: string | undefined,
  params: VlsConstitutionalBootcampListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsConstitutionalBootcampListResponse, unknown>(
    vlsConstitutionalBootcampKeys.list(clientKey, params),
    () => getVlsConstitutionalBootcampRegistrations(params, superAdminClientKey),
    { keepPreviousData: true, enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsConstitutionalBootcampSummary = (
  clientKey: string | undefined,
  params: VlsConstitutionalBootcampExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsConstitutionalBootcampSummaryResponse, unknown>(
    vlsConstitutionalBootcampKeys.summary(clientKey, params),
    () => getVlsConstitutionalBootcampSummary(params, superAdminClientKey),
    { enabled, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useVlsConstitutionalBootcampRegistration = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useQuery<VlsConstitutionalBootcampResponse, unknown>(
    vlsConstitutionalBootcampKeys.detail(clientKey, id ?? 0),
    () => getVlsConstitutionalBootcampRegistrationById(id as number, superAdminClientKey),
    { enabled: enabled && id !== null, refetchOnWindowFocus: false, retry: shouldRetryRequest },
  );
};

export const useCreateVlsConstitutionalBootcampRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsConstitutionalBootcampResponse, unknown, CreateVlsConstitutionalBootcampPayload>(
    (payload) => createVlsConstitutionalBootcampRegistration(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Constitutional Bootcamp registration created successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsConstitutionalErrorMessage(error, 'Unable to create registration.'), { variant: 'error' });
      },
    },
  );
};

interface UpdateVariables {
  id: number;
  payload: UpdateVlsConstitutionalBootcampPayload;
}

export const useUpdateVlsConstitutionalBootcampRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsConstitutionalBootcampResponse, unknown, UpdateVariables>(
    ({ id, payload }) => updateVlsConstitutionalBootcampRegistration(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Constitutional Bootcamp registration updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.summary(clientKey));
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getVlsConstitutionalErrorMessage(error, 'Unable to update registration.'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteVlsConstitutionalBootcampRegistration = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);
  return useMutation<VlsConstitutionalBootcampDeleteResponse, unknown, number>(
    (id) => deleteVlsConstitutionalBootcampRegistration(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Constitutional Bootcamp registration deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.clientLists(clientKey));
        queryClient.invalidateQueries(vlsConstitutionalBootcampKeys.summary(clientKey));
        queryClient.removeQueries(vlsConstitutionalBootcampKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getVlsConstitutionalErrorMessage(error, 'Unable to delete registration.'), { variant: 'error' });
      },
    },
  );
};

