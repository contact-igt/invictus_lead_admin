import { useQuery, useMutation, useQueryClient } from 'react-query';
import { _axios } from 'helper/axios';
import { ClientPayload } from 'services/client';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';

export interface ClientRecord {
  id: number;
  name: string;
  client_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

const QUERY_KEY = ['clients'];

export const useClientQuery = () =>
  useQuery<ClientRecord[]>(QUERY_KEY, async () => {
    const res = await _axios('get', '/clients');
    return (res?.data ?? []) as ClientRecord[];
  });

export const useCreateClientMutation = () => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    (payload: ClientPayload) => _axios('post', '/clients', payload),
    {
      onSuccess: () => {
        enqueueSnackbar('Client created successfully', { variant: 'success' });
        qc.invalidateQueries(QUERY_KEY);
      },
      onError: (error: any) => {
        const err = error as AxiosError<any>;
        enqueueSnackbar(err.response?.data?.message || 'Failed to create client', {
          variant: 'error',
        });
      },
    },
  );
};

export const useUpdateClientMutation = () => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<ClientPayload> }) =>
      _axios('patch', `/clients/${id}`, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Client updated successfully', { variant: 'success' });
        qc.invalidateQueries(QUERY_KEY);
      },
      onError: (error: any) => {
        const err = error as AxiosError<any>;
        enqueueSnackbar(err.response?.data?.message || 'Failed to update client', {
          variant: 'error',
        });
      },
    },
  );
};

export const useDeleteClientMutation = () => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    (id: number | string) => _axios('delete', `/clients/${id}`),
    {
      onSuccess: () => {
        enqueueSnackbar('Client deleted successfully', { variant: 'success' });
        qc.invalidateQueries(QUERY_KEY);
      },
      onError: (error: any) => {
        const err = error as AxiosError<any>;
        enqueueSnackbar(err.response?.data?.message || 'Failed to delete client', {
          variant: 'error',
        });
      },
    },
  );
};
