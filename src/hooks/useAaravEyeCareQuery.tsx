import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createAaravEyeCareLead,
  deleteAaravEyeCareLead,
  getAaravEyeCareLeadById,
  getAaravEyeCareLeads,
  getAaravEyeCareSummary,
  updateAaravEyeCareLead,
} from 'services/aaravEyeCare.service';
import {
  getAaravErrorMessage,
  getAaravErrorStatus,
} from 'components/sections/aaravEyeCare/aaravEyeCareUtils';
import type {
  AaravEyeCareDeleteResponse,
  AaravEyeCareLeadResponse,
  AaravEyeCareListParams,
  AaravEyeCareExportParams,
  AaravEyeCareListResponse,
  AaravEyeCareSummaryResponse,
  CreateAaravEyeCareLeadPayload,
  UpdateAaravEyeCareLeadPayload,
} from 'types/aaravEyeCare';

export const aaravEyeCareKeys = {
  all: ['aarav-eye-care'] as const,
  lists: () => [...aaravEyeCareKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) =>
    [...aaravEyeCareKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: AaravEyeCareListParams) =>
    [...aaravEyeCareKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: AaravEyeCareExportParams) =>
    [...aaravEyeCareKeys.all, 'summary', clientKey, params] as const,
  details: () => [...aaravEyeCareKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...aaravEyeCareKeys.details(), clientKey, id] as const,
};

const shouldRetryAaravRequest = (failureCount: number, error: unknown): boolean => {
  const status = getAaravErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useAaravEyeCareLeads = (
  clientKey: string | undefined,
  params: AaravEyeCareListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<AaravEyeCareListResponse, unknown>(
    aaravEyeCareKeys.list(clientKey, params),
    () => getAaravEyeCareLeads(params, superAdminClientKey),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryAaravRequest,
    },
  );
};

export const useAaravEyeCareSummary = (
  clientKey: string | undefined,
  params: AaravEyeCareExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<AaravEyeCareSummaryResponse, unknown>(
    aaravEyeCareKeys.summary(clientKey, params),
    () => getAaravEyeCareSummary(params, superAdminClientKey),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryAaravRequest,
    },
  );
};

export const useAaravEyeCareLead = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<AaravEyeCareLeadResponse, unknown>(
    aaravEyeCareKeys.detail(clientKey, id ?? 0),
    () => getAaravEyeCareLeadById(id as number, superAdminClientKey),
    {
      enabled: enabled && id !== null,
      refetchOnWindowFocus: false,
      retry: shouldRetryAaravRequest,
    },
  );
};

export const useCreateAaravEyeCareLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<AaravEyeCareLeadResponse, unknown, CreateAaravEyeCareLeadPayload>(
    (payload) => createAaravEyeCareLead(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Aarav Eye Care lead created successfully', { variant: 'success' });
        queryClient.invalidateQueries(aaravEyeCareKeys.clientLists(clientKey));
        queryClient.invalidateQueries(aaravEyeCareKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getAaravErrorMessage(error, 'Unable to create the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface UpdateAaravMutationVariables {
  id: number;
  payload: UpdateAaravEyeCareLeadPayload;
}

export const useUpdateAaravEyeCareLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<AaravEyeCareLeadResponse, unknown, UpdateAaravMutationVariables>(
    ({ id, payload }) => updateAaravEyeCareLead(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Aarav Eye Care lead updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(aaravEyeCareKeys.clientLists(clientKey));
        queryClient.invalidateQueries(aaravEyeCareKeys.summary(clientKey));
        queryClient.invalidateQueries(aaravEyeCareKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getAaravErrorMessage(error, 'Unable to update the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeleteAaravEyeCareLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<AaravEyeCareDeleteResponse, unknown, number>(
    (id) => deleteAaravEyeCareLead(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Aarav Eye Care lead deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(aaravEyeCareKeys.clientLists(clientKey));
        queryClient.invalidateQueries(aaravEyeCareKeys.summary(clientKey));
        queryClient.removeQueries(aaravEyeCareKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getAaravErrorMessage(error, 'Unable to delete the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};
