import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { CrmApis, CrmCall, CrmCustomField, CrmFieldMapping, CrmIntegration, CrmProvider } from 'services/crm';

interface ErrorPayload {
  message?: string;
}

const errorMessage = (error: unknown, fallback: string) =>
  (error as AxiosError<ErrorPayload>)?.response?.data?.message || fallback;

export const useCrmFieldsQuery = (
  clientKey: string | undefined,
  entityType: string,
  options: { enabled?: boolean; includeArchived?: boolean } = {},
) =>
  useQuery<CrmCustomField[]>(
    ['crm-fields', clientKey, entityType, options.includeArchived ?? false],
    async () => {
      const res = await CrmApis.getFields(clientKey, entityType, options.includeArchived);
      return (res?.data ?? []) as CrmCustomField[];
    },
    { enabled: options.enabled ?? true },
  );

export const useCreateCrmFieldMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<CrmCustomField>) => CrmApis.createField(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Field created', { variant: 'success' });
      qc.invalidateQueries(['crm-fields']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to create field'), { variant: 'error' });
    },
  });
};

export const useUpdateCrmFieldMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number; data: Partial<CrmCustomField> }) => CrmApis.updateField(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Field updated', { variant: 'success' });
        qc.invalidateQueries(['crm-fields']);
      },
      onError: (error) => {
        enqueueSnackbar(errorMessage(error, 'Failed to update field'), { variant: 'error' });
      },
    },
  );
};

export const useArchiveCrmFieldMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number) => CrmApis.archiveField(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Field archived', { variant: 'success' });
      qc.invalidateQueries(['crm-fields']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to archive field'), { variant: 'error' });
    },
  });
};

export const useCrmCallsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<{ data: CrmCall[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['crm-calls', clientKey, params],
    async () => {
      const res = await CrmApis.getCalls(clientKey, params);
      return res as { data: CrmCall[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

export const useCrmIntegrationsQuery = (clientKey: string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<CrmIntegration[]>(
    ['crm-integrations', clientKey],
    async () => {
      const res = await CrmApis.getIntegrations(clientKey);
      return (res?.data ?? []) as CrmIntegration[];
    },
    { enabled: options.enabled ?? true },
  );

export const useUpdateCrmIntegrationMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ provider, data }: { provider: CrmProvider; data: { enabled?: boolean; config?: Record<string, string> } }) =>
      CrmApis.updateIntegration(clientKey, provider, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Integration updated', { variant: 'success' });
        qc.invalidateQueries(['crm-integrations']);
      },
      onError: (error) => {
        enqueueSnackbar(errorMessage(error, 'Failed to update integration'), { variant: 'error' });
      },
    },
  );
};

export const useCrmMappingsQuery = (clientKey: string | undefined, provider: CrmProvider, options: { enabled?: boolean } = {}) =>
  useQuery<CrmFieldMapping[]>(
    ['crm-mappings', clientKey, provider],
    async () => {
      const res = await CrmApis.getMappings(clientKey, provider);
      return (res?.data ?? []) as CrmFieldMapping[];
    },
    { enabled: options.enabled ?? true },
  );

export const useSaveCrmMappingsMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ provider, mappings }: { provider: CrmProvider; mappings: Array<{ external_field: string; target_type: string; target_field: string }> }) =>
      CrmApis.saveMappings(clientKey, provider, mappings),
    {
      onSuccess: () => {
        enqueueSnackbar('Field mapping saved', { variant: 'success' });
        qc.invalidateQueries(['crm-mappings']);
      },
      onError: (error) => {
        enqueueSnackbar(errorMessage(error, 'Failed to save field mapping'), { variant: 'error' });
      },
    },
  );
};

export const useReorderCrmFieldsMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((orderedIds: number[]) => CrmApis.reorderFields(clientKey, orderedIds), {
    onSuccess: () => {
      qc.invalidateQueries(['crm-fields']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to reorder fields'), { variant: 'error' });
    },
  });
};
