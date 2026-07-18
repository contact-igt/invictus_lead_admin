import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createShantiEyeTechLead,
  deleteShantiEyeTechLead,
  exportShantiEyeTechLeads,
  getShantiEyeTechLeadById,
  getShantiEyeTechLeads,
  getShantiEyeTechSummary,
  updateShantiEyeTechLead,
} from 'services/shantiEyeTech.service';
import {
  getShantiEyeTechErrorMessage,
  getShantiEyeTechErrorStatus,
} from 'components/sections/shantiEyeTech/shantiEyeTechUtils';
import type {
  ShantiEyeTechDeleteResponse,
  ShantiEyeTechExportFormat,
  ShantiEyeTechExportParams,
  ShantiEyeTechLeadResponse,
  ShantiEyeTechListParams,
  ShantiEyeTechListResponse,
  ShantiEyeTechSummaryResponse,
  CreateShantiEyeTechLeadPayload,
  UpdateShantiEyeTechLeadPayload,
} from 'types/shantiEyeTech';

export const shantiEyeTechKeys = {
  all: ['shantiEyeTech'] as const,
  lists: () => [...shantiEyeTechKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) =>
    [...shantiEyeTechKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: ShantiEyeTechListParams) =>
    [...shantiEyeTechKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: ShantiEyeTechExportParams) =>
    [...shantiEyeTechKeys.all, 'summary', clientKey, params] as const,
  details: () => [...shantiEyeTechKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...shantiEyeTechKeys.details(), clientKey, id] as const,
};

const shouldRetryShantiEyeTechRequest = (failureCount: number, error: unknown): boolean => {
  const status = getShantiEyeTechErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useShantiEyeTechLeads = (
  clientKey: string | undefined,
  params: ShantiEyeTechListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<ShantiEyeTechListResponse, unknown>(
    shantiEyeTechKeys.list(clientKey, params),
    () => getShantiEyeTechLeads(params, superAdminClientKey),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryShantiEyeTechRequest,
    },
  );
};

export const useShantiEyeTechSummary = (
  clientKey: string | undefined,
  params: ShantiEyeTechExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<ShantiEyeTechSummaryResponse, unknown>(
    shantiEyeTechKeys.summary(clientKey, params),
    () => getShantiEyeTechSummary(params, superAdminClientKey),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryShantiEyeTechRequest,
    },
  );
};

export const useShantiEyeTechLead = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<ShantiEyeTechLeadResponse, unknown>(
    shantiEyeTechKeys.detail(clientKey, id ?? 0),
    () => getShantiEyeTechLeadById(id as number, superAdminClientKey),
    {
      enabled: enabled && id !== null,
      refetchOnWindowFocus: false,
      retry: shouldRetryShantiEyeTechRequest,
    },
  );
};

export const useCreateShantiEyeTechLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<ShantiEyeTechLeadResponse, unknown, CreateShantiEyeTechLeadPayload>(
    (payload) => createShantiEyeTechLead(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Shanti Eye Tech lead created successfully', { variant: 'success' });
        queryClient.invalidateQueries(shantiEyeTechKeys.clientLists(clientKey));
        queryClient.invalidateQueries(shantiEyeTechKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getShantiEyeTechErrorMessage(error, 'Unable to create the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface UpdateShantiEyeTechMutationVariables {
  id: number;
  payload: UpdateShantiEyeTechLeadPayload;
}

export const useUpdateShantiEyeTechLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<ShantiEyeTechLeadResponse, unknown, UpdateShantiEyeTechMutationVariables>(
    ({ id, payload }) => updateShantiEyeTechLead(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Shanti Eye Tech lead updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(shantiEyeTechKeys.clientLists(clientKey));
        queryClient.invalidateQueries(shantiEyeTechKeys.summary(clientKey));
        queryClient.invalidateQueries(shantiEyeTechKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getShantiEyeTechErrorMessage(error, 'Unable to update the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeleteShantiEyeTechLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<ShantiEyeTechDeleteResponse, unknown, number>(
    (id) => deleteShantiEyeTechLead(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Shanti Eye Tech lead deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(shantiEyeTechKeys.clientLists(clientKey));
        queryClient.invalidateQueries(shantiEyeTechKeys.summary(clientKey));
        queryClient.removeQueries(shantiEyeTechKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getShantiEyeTechErrorMessage(error, 'Unable to delete the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};
interface ExportShantiEyeTechMutationVariables {
  format: ShantiEyeTechExportFormat;
  params: ShantiEyeTechExportParams;
}

export const useExportShantiEyeTechLeads = (clientKey?: string) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation(({ format, params }: ExportShantiEyeTechMutationVariables) =>
    exportShantiEyeTechLeads(format, params, superAdminClientKey),
  );
};
