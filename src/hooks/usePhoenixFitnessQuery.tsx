import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createPhoenixFitnessLead,
  deletePhoenixFitnessLead,
  exportPhoenixFitnessLeads,
  getPhoenixFitnessLeadById,
  getPhoenixFitnessLeads,
  getPhoenixFitnessSummary,
  updatePhoenixFitnessLead,
} from 'services/phoenixFitness.service';
import {
  getPhoenixFitnessErrorMessage,
  getPhoenixFitnessErrorStatus,
} from 'components/sections/phoenixFitness/phoenixFitnessUtils';
import type {
  PhoenixFitnessDeleteResponse,
  PhoenixFitnessExportFormat,
  PhoenixFitnessExportParams,
  PhoenixFitnessLeadResponse,
  PhoenixFitnessListParams,
  PhoenixFitnessListResponse,
  PhoenixFitnessSummaryResponse,
  CreatePhoenixFitnessLeadPayload,
  UpdatePhoenixFitnessLeadPayload,
} from 'types/phoenixFitness';

export const phoenixFitnessKeys = {
  all: ['phoenixFitness'] as const,
  lists: () => [...phoenixFitnessKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) =>
    [...phoenixFitnessKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: PhoenixFitnessListParams) =>
    [...phoenixFitnessKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: PhoenixFitnessExportParams) =>
    [...phoenixFitnessKeys.all, 'summary', clientKey, params] as const,
  details: () => [...phoenixFitnessKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...phoenixFitnessKeys.details(), clientKey, id] as const,
};

const shouldRetryPhoenixFitnessRequest = (failureCount: number, error: unknown): boolean => {
  const status = getPhoenixFitnessErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const usePhoenixFitnessLeads = (
  clientKey: string | undefined,
  params: PhoenixFitnessListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<PhoenixFitnessListResponse, unknown>(
    phoenixFitnessKeys.list(clientKey, params),
    () => getPhoenixFitnessLeads(params, superAdminClientKey),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryPhoenixFitnessRequest,
    },
  );
};

export const usePhoenixFitnessSummary = (
  clientKey: string | undefined,
  params: PhoenixFitnessExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<PhoenixFitnessSummaryResponse, unknown>(
    phoenixFitnessKeys.summary(clientKey, params),
    () => getPhoenixFitnessSummary(params, superAdminClientKey),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryPhoenixFitnessRequest,
    },
  );
};

export const usePhoenixFitnessLead = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<PhoenixFitnessLeadResponse, unknown>(
    phoenixFitnessKeys.detail(clientKey, id ?? 0),
    () => getPhoenixFitnessLeadById(id as number, superAdminClientKey),
    {
      enabled: enabled && id !== null,
      refetchOnWindowFocus: false,
      retry: shouldRetryPhoenixFitnessRequest,
    },
  );
};

export const useCreatePhoenixFitnessLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<PhoenixFitnessLeadResponse, unknown, CreatePhoenixFitnessLeadPayload>(
    (payload) => createPhoenixFitnessLead(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Phoenix Fitness lead created successfully', { variant: 'success' });
        queryClient.invalidateQueries(phoenixFitnessKeys.clientLists(clientKey));
        queryClient.invalidateQueries(phoenixFitnessKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getPhoenixFitnessErrorMessage(error, 'Unable to create the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface UpdatePhoenixFitnessMutationVariables {
  id: number;
  payload: UpdatePhoenixFitnessLeadPayload;
}

export const useUpdatePhoenixFitnessLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<PhoenixFitnessLeadResponse, unknown, UpdatePhoenixFitnessMutationVariables>(
    ({ id, payload }) => updatePhoenixFitnessLead(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Phoenix Fitness lead updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(phoenixFitnessKeys.clientLists(clientKey));
        queryClient.invalidateQueries(phoenixFitnessKeys.summary(clientKey));
        queryClient.invalidateQueries(phoenixFitnessKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getPhoenixFitnessErrorMessage(error, 'Unable to update the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeletePhoenixFitnessLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<PhoenixFitnessDeleteResponse, unknown, number>(
    (id) => deletePhoenixFitnessLead(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Phoenix Fitness lead deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(phoenixFitnessKeys.clientLists(clientKey));
        queryClient.invalidateQueries(phoenixFitnessKeys.summary(clientKey));
        queryClient.removeQueries(phoenixFitnessKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getPhoenixFitnessErrorMessage(error, 'Unable to delete the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};
interface ExportPhoenixFitnessMutationVariables {
  format: PhoenixFitnessExportFormat;
  params: PhoenixFitnessExportParams;
}

export const useExportPhoenixFitnessLeads = (clientKey?: string) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation(({ format, params }: ExportPhoenixFitnessMutationVariables) =>
    exportPhoenixFitnessLeads(format, params, superAdminClientKey),
  );
};
