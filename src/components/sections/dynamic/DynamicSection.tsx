import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Paper, Stack, Drawer } from '@mui/material';
import { useSnackbar } from 'notistack';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import DynamicTable from './DynamicTable';
import DynamicForm from './DynamicForm';
import { TableConfig } from 'config/clients';
import { _axios } from 'helper/axios';

interface DynamicSectionProps {
  config: TableConfig;
  clientKey?: string;
}

const DynamicSection = ({ config, clientKey }: DynamicSectionProps) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | string | null>(null);

  const queryKey = [`dynamic_data_${config.id}`, config.endpoint];

  const { data, isLoading } = useQuery(
    queryKey,
    () => _axios('get', config.endpoint),
    { staleTime: 5 * 60 * 1000 }
  );

  const mutation = useMutation(
    (payload: any) => {
      if (selectedRecord) {
        return _axios('patch', `${config.endpoint}/${selectedRecord.id}`, payload);
      }
      // Include _client_key so the backend can resolve client_id for super-admin
      const createPayload = clientKey ? { ...payload, _client_key: clientKey } : payload;
      return _axios('post', config.endpoint, createPayload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        handleCloseDrawer();
      },
      onError: (error) => {
        console.error('Mutation Error:', error);
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number | string) => _axios('delete', `${config.endpoint}/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      }
    }
  );

  const inlineUpdateMutation = useMutation(
    ({ id, field, value }: { id: number | string; field: string; value: string }) =>
      _axios('patch', `${config.endpoint}/${id}`, { [field]: value }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Failed to update this field';
        enqueueSnackbar(message, { variant: 'error' });
        console.error('Inline update error:', error);
      }
    }
  );

  const handleOpenDrawer = (record: any | null = null, viewOnly = false) => {
    setSelectedRecord(record);
    setIsViewOnly(viewOnly);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setIsViewOnly(false);
    setSelectedRecord(null);
  };

  const handleEdit = (id: number | string) => {
    const record = data?.data?.find((r: any) => r.id === id);
    if (record) handleOpenDrawer(record, false);
  };

  const handleView = (id: number | string) => {
    const record = data?.data?.find((r: any) => r.id === id);
    if (record) handleOpenDrawer(record, true);
  };

  const handleDeletePrompt = (id: number | string) => {
    setSelectedDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (selectedDeleteId === null) return;

    deleteMutation.mutate(selectedDeleteId, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
      },
    });
  };

  const handleInlineUpdate = (id: number | string, field: string, value: string) => {
    inlineUpdateMutation.mutate({ id, field, value });
  };

  if (isLoading) return <PageLoader />;

  return (
    <Stack direction="column" spacing={1.5} width="100%" p={3.5}>
      <PageTitle
        title={config.title}
        btnText={` ${config.title}`}
        isAddEnable
        searchText={searchText}
        handleInputChange={(e: any) => setSearchText(e.target.value)}
        openModal={() => handleOpenDrawer(null)}
      />

      <Paper
        elevation={0}
        sx={{
          p: 0,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <DynamicTable
          config={config}
          data={data?.data || []}
          searchText={searchText}
          isLoading={isLoading}
          onInlineUpdate={handleInlineUpdate}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeletePrompt}
        />
      </Paper>

      <Popup
        open={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedDeleteId(null);
        }}
        showOnClose={false}
      >
        <ConfirmAlert
          title="Are you sure you want to delete this record?"
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleteConfirmOpen(false);
            setSelectedDeleteId(null);
          }}
          isLoading={deleteMutation.isLoading}
        />
      </Popup>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100vw', sm: 500 }, borderLeft: 0 }
        }}
      >
        <DynamicForm
          title={config.title}
          columns={config.columns}
          initialValues={selectedRecord}
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={handleCloseDrawer}
          isLoading={mutation.isLoading}
          isReadOnly={isViewOnly}
        />
      </Drawer>
    </Stack>
  );
};

export default DynamicSection;
