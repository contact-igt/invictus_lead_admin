import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createAntardrashtiNetralayaLead,
  deleteAntardrashtiNetralayaLead,
  exportAntardrashtiNetralayaLeads,
  getAntardrashtiNetralayaLeadById,
  getAntardrashtiNetralayaLeads,
  getAntardrashtiNetralayaSummary,
  updateAntardrashtiNetralayaLead,
} from 'services/antardrashtiNetralaya.service';
import {
  getAntardrashtiErrorMessage,
  getAntardrashtiErrorStatus,
} from 'components/sections/antardrashtiNetralaya/antardrashtiNetralayaUtils';
import type {
  AntardrashtiNetralayaDeleteResponse,
  AntardrashtiNetralayaExportFormat,
  AntardrashtiNetralayaExportParams,
  AntardrashtiNetralayaLeadResponse,
  AntardrashtiNetralayaListParams,
  AntardrashtiNetralayaListResponse,
  AntardrashtiNetralayaSummaryResponse,
  CreateAntardrashtiNetralayaLeadPayload,
  UpdateAntardrashtiNetralayaLeadPayload,
} from 'types/antardrashtiNetralaya';

export const antardrashtiNetralayaKeys = {
  all: ['antardrashti-netralaya'] as const,
  lists: () => [...antardrashtiNetralayaKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) =>
    [...antardrashtiNetralayaKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: AntardrashtiNetralayaListParams) =>
    [...antardrashtiNetralayaKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: AntardrashtiNetralayaExportParams) =>
    [...antardrashtiNetralayaKeys.all, 'summary', clientKey, params] as const,
  details: () => [...antardrashtiNetralayaKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...antardrashtiNetralayaKeys.details(), clientKey, id] as const,
};

const shouldRetryAntardrashtiRequest = (failureCount: number, error: unknown): boolean => {
  const status = getAntardrashtiErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const useAntardrashtiNetralayaLeads = (
  clientKey: string | undefined,
  params: AntardrashtiNetralayaListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<AntardrashtiNetralayaListResponse, unknown>(
    antardrashtiNetralayaKeys.list(clientKey, params),
    () => getAntardrashtiNetralayaLeads(params, superAdminClientKey),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryAntardrashtiRequest,
    },
  );
};

export const useAntardrashtiNetralayaSummary = (
  clientKey: string | undefined,
  params: AntardrashtiNetralayaExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<AntardrashtiNetralayaSummaryResponse, unknown>(
    antardrashtiNetralayaKeys.summary(clientKey, params),
    () => getAntardrashtiNetralayaSummary(params, superAdminClientKey),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryAntardrashtiRequest,
    },
  );
};

export const useAntardrashtiNetralayaLead = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<AntardrashtiNetralayaLeadResponse, unknown>(
    antardrashtiNetralayaKeys.detail(clientKey, id ?? 0),
    () => getAntardrashtiNetralayaLeadById(id as number, superAdminClientKey),
    {
      enabled: enabled && id !== null,
      refetchOnWindowFocus: false,
      retry: shouldRetryAntardrashtiRequest,
    },
  );
};

export const useCreateAntardrashtiNetralayaLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<AntardrashtiNetralayaLeadResponse, unknown, CreateAntardrashtiNetralayaLeadPayload>(
    (payload) => createAntardrashtiNetralayaLead(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('Antardrashti Netralaya lead created successfully', { variant: 'success' });
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.clientLists(clientKey));
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getAntardrashtiErrorMessage(error, 'Unable to create the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface UpdateAntardrashtiMutationVariables {
  id: number;
  payload: UpdateAntardrashtiNetralayaLeadPayload;
}

export const useUpdateAntardrashtiNetralayaLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<AntardrashtiNetralayaLeadResponse, unknown, UpdateAntardrashtiMutationVariables>(
    ({ id, payload }) => updateAntardrashtiNetralayaLead(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('Antardrashti Netralaya lead updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.clientLists(clientKey));
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.summary(clientKey));
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getAntardrashtiErrorMessage(error, 'Unable to update the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeleteAntardrashtiNetralayaLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<AntardrashtiNetralayaDeleteResponse, unknown, number>(
    (id) => deleteAntardrashtiNetralayaLead(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('Antardrashti Netralaya lead deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.clientLists(clientKey));
        queryClient.invalidateQueries(antardrashtiNetralayaKeys.summary(clientKey));
        queryClient.removeQueries(antardrashtiNetralayaKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getAntardrashtiErrorMessage(error, 'Unable to delete the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};
interface ExportAntardrashtiMutationVariables {
  format: AntardrashtiNetralayaExportFormat;
  params: AntardrashtiNetralayaExportParams;
}

export const useExportAntardrashtiNetralayaLeads = (clientKey?: string) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation(({ format, params }: ExportAntardrashtiMutationVariables) =>
    exportAntardrashtiNetralayaLeads(format, params, superAdminClientKey),
  );
};
