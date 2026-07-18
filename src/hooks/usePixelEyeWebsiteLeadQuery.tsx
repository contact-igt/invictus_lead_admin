import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  createPixelEyeWebsiteLead,
  deletePixelEyeWebsiteLead,
  exportPixelEyeWebsiteLeads,
  getPixelEyeWebsiteLeadById,
  getPixelEyeWebsiteLeads,
  getPixelEyeWebsiteLeadSummary,
  updatePixelEyeWebsiteLead,
} from 'services/pixelEyeWebsiteLead.service';
import {
  getPixelEyeWebsiteLeadErrorMessage,
  getPixelEyeWebsiteLeadErrorStatus,
} from 'components/sections/pixel-eye-website-leads/pixelEyeWebsiteLeadUtils';
import type {
  PixelEyeWebsiteLeadDeleteResponse,
  PixelEyeWebsiteLeadExportFormat,
  PixelEyeWebsiteLeadExportParams,
  PixelEyeWebsiteLeadListParams,
  PixelEyeWebsiteLeadListResponse,
  PixelEyeWebsiteLeadResponse,
  PixelEyeWebsiteLeadSummaryResponse,
  CreatePixelEyeWebsiteLeadPayload,
  UpdatePixelEyeWebsiteLeadPayload,
} from 'types/pixelEyeWebsiteLead';

export const pixelEyeWebsiteLeadKeys = {
  all: ['pixeleye-website-leads'] as const,
  lists: () => [...pixelEyeWebsiteLeadKeys.all, 'list'] as const,
  clientLists: (clientKey: string | undefined) => [...pixelEyeWebsiteLeadKeys.lists(), clientKey] as const,
  list: (clientKey: string | undefined, params: PixelEyeWebsiteLeadListParams) =>
    [...pixelEyeWebsiteLeadKeys.clientLists(clientKey), params] as const,
  summary: (clientKey: string | undefined, params?: PixelEyeWebsiteLeadExportParams) =>
    [...pixelEyeWebsiteLeadKeys.all, 'summary', clientKey, params] as const,
  details: () => [...pixelEyeWebsiteLeadKeys.all, 'detail'] as const,
  detail: (clientKey: string | undefined, id: number) =>
    [...pixelEyeWebsiteLeadKeys.details(), clientKey, id] as const,
};

const shouldRetryPixelEyeWebsiteLeadRequest = (failureCount: number, error: unknown): boolean => {
  const status = getPixelEyeWebsiteLeadErrorStatus(error);
  if (status && [400, 401, 403, 404, 429].includes(status)) return false;
  return failureCount < 2;
};

const useSuperAdminClientKey = (clientKey?: string): string | undefined => {
  const { user } = useAuth();
  return user?.role === 'super-admin' ? clientKey : undefined;
};

export const usePixelEyeWebsiteLeads = (
  clientKey: string | undefined,
  params: PixelEyeWebsiteLeadListParams,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<PixelEyeWebsiteLeadListResponse, unknown>(
    pixelEyeWebsiteLeadKeys.list(clientKey, params),
    () => getPixelEyeWebsiteLeads(params, superAdminClientKey),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryPixelEyeWebsiteLeadRequest,
    },
  );
};

export const usePixelEyeWebsiteLeadSummary = (
  clientKey: string | undefined,
  params: PixelEyeWebsiteLeadExportParams = {},
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<PixelEyeWebsiteLeadSummaryResponse, unknown>(
    pixelEyeWebsiteLeadKeys.summary(clientKey, params),
    () => getPixelEyeWebsiteLeadSummary(params, superAdminClientKey),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: shouldRetryPixelEyeWebsiteLeadRequest,
    },
  );
};

export const usePixelEyeWebsiteLead = (
  clientKey: string | undefined,
  id: number | null,
  enabled = true,
) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useQuery<PixelEyeWebsiteLeadResponse, unknown>(
    pixelEyeWebsiteLeadKeys.detail(clientKey, id ?? 0),
    () => getPixelEyeWebsiteLeadById(id as number, superAdminClientKey),
    {
      enabled: enabled && id !== null,
      refetchOnWindowFocus: false,
      retry: shouldRetryPixelEyeWebsiteLeadRequest,
    },
  );
};

export const useCreatePixelEyeWebsiteLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<PixelEyeWebsiteLeadResponse, unknown, CreatePixelEyeWebsiteLeadPayload>(
    (payload) => createPixelEyeWebsiteLead(payload, superAdminClientKey),
    {
      onSuccess: () => {
        enqueueSnackbar('PixelEye Website Lead created successfully', { variant: 'success' });
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.clientLists(clientKey));
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.summary(clientKey));
      },
      onError: (error) => {
        enqueueSnackbar(getPixelEyeWebsiteLeadErrorMessage(error, 'Unable to create the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface UpdatePixelEyeWebsiteLeadMutationVariables {
  id: number;
  payload: UpdatePixelEyeWebsiteLeadPayload;
}

export const useUpdatePixelEyeWebsiteLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<PixelEyeWebsiteLeadResponse, unknown, UpdatePixelEyeWebsiteLeadMutationVariables>(
    ({ id, payload }) => updatePixelEyeWebsiteLead(id, payload, superAdminClientKey),
    {
      onSuccess: (_response, variables) => {
        enqueueSnackbar('PixelEye Website Lead updated successfully', { variant: 'success' });
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.clientLists(clientKey));
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.summary(clientKey));
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.detail(clientKey, variables.id));
      },
      onError: (error) => {
        enqueueSnackbar(getPixelEyeWebsiteLeadErrorMessage(error, 'Unable to update the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeletePixelEyeWebsiteLead = (clientKey?: string) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation<PixelEyeWebsiteLeadDeleteResponse, unknown, number>(
    (id) => deletePixelEyeWebsiteLead(id, superAdminClientKey),
    {
      onSuccess: (_response, id) => {
        enqueueSnackbar('PixelEye Website Lead deleted successfully', { variant: 'success' });
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.clientLists(clientKey));
        queryClient.invalidateQueries(pixelEyeWebsiteLeadKeys.summary(clientKey));
        queryClient.removeQueries(pixelEyeWebsiteLeadKeys.detail(clientKey, id), { exact: true });
      },
      onError: (error) => {
        enqueueSnackbar(getPixelEyeWebsiteLeadErrorMessage(error, 'Unable to delete the lead.'), {
          variant: 'error',
        });
      },
    },
  );
};

interface ExportPixelEyeWebsiteLeadMutationVariables {
  format: PixelEyeWebsiteLeadExportFormat;
  params: PixelEyeWebsiteLeadExportParams;
}

export const useExportPixelEyeWebsiteLeads = (clientKey?: string) => {
  const superAdminClientKey = useSuperAdminClientKey(clientKey);

  return useMutation(({ format, params }: ExportPixelEyeWebsiteLeadMutationVariables) =>
    exportPixelEyeWebsiteLeads(format, params, superAdminClientKey),
  );
};
