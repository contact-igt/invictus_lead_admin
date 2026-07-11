import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createRioLead,
  deleteRioLead,
  exportRioLeads,
  getRioLeadById,
  getRioLeads,
  getRioSummary,
  updateRioLead,
} from 'services/rio.service';
import {
  getRioErrorMessage,
  getRioErrorStatus,
} from 'components/sections/rio/rioUtils';
import type {
  RioDeleteResponse,
  RioExportFormat,
  RioExportParams,
  RioLeadResponse,
  RioListParams,
  RioListResponse,
  RioSummaryResponse,
  CreateRioLeadPayload,
  UpdateRioLeadPayload,
} from 'types/rio';

export const rioKeys = {
  all: ['rio'] as const,
  lists: () => [...rioKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) =>
    [...rioKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: RioListParams) =>
    [...rioKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined) => [...rioKeys.all, 'summary', clientKey] as const,
  details: () => [...rioKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...rioKeys.details(), clientKey, id] as const,
};

const shouldRetryRioRequest = (failureCount: number, error: unknown): boolean => {
  const status = getRioErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useRioLeads = (
  clientKey: string | undefined,
  params: RioListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<RioListResponse, unknown>(
    rioKeys.list(clientKey, params),
    () => getRioLeads(params, superAdminClientKey),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryRioRequest,
    },
  );
};

export const useRioSummary = (
  clientKey: string | undefined,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<RioSummaryResponse, unknown>(
    rioKeys.summary(clientKey),
    () => getRioSummary(superAdminClientKey),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryRioRequest,
    },
  );
};

export const useRioLead = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<RioLeadResponse, unknown>(
    rioKeys.detail(clientKey, id ?? 0),
    () => getRioLeadById(id as number, superAdminClientKey),
    {
      enabled: enabled && id !== null,
      refetchOnWindowFocus: false,
      retry: shouldRetryRioRequest,
    },
  );
};

export const useCreateRioLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<RioLeadResponse, unknown, CreateRioLeadPayload>(
    (payload) => createRioLead(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Rio lead created successfully', { variant: 'success' });
        queryClient.invalidateQueries(rioKeys.clientLists(clientKey));
        queryClient.invalidateQueries(rioKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getRioErrorMessage(error, 'Unable to create the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface UpdateRioMutationVariables {
  id: number;
  payload: UpdateRioLeadPayload;
}

export const useUpdateRioLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<RioLeadResponse, unknown, UpdateRioMutationVariables>(
    ({ id, payload }) => updateRioLead(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Rio lead updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(rioKeys.clientLists(clientKey));
        queryClient.invalidateQueries(rioKeys.summary(clientKey));
        queryClient.invalidateQueries(rioKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getRioErrorMessage(error, 'Unable to update the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeleteRioLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<RioDeleteResponse, unknown, number>(
    (id) => deleteRioLead(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Rio lead deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(rioKeys.clientLists(clientKey));
        queryClient.invalidateQueries(rioKeys.summary(clientKey));
        queryClient.removeQueries(rioKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getRioErrorMessage(error, 'Unable to delete the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};
interface ExportRioMutationVariables {
  format: RioExportFormat;
  params: RioExportParams;
}

export const useExportRioLeads = (clientKey?: string) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation(({ format, params }: ExportRioMutationVariables) =>
    exportRioLeads(format, params, superAdminClientKey),
  );
};
