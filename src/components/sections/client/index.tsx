import { useState, ChangeEvent } from 'react';
import { Drawer, Paper, Stack } from '@mui/material';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import {
  ClientRecord,
  useClientQuery,
  useCreateClientMutation,
  useDeleteClientMutation,
  useUpdateClientMutation,
} from 'components/hooks/useClientQuery';
import ClientTable from './ClientTable';
import ClientForm from './ClientForm';

const ClientSection = () => {
  const { data: clients = [], isLoading } = useClientQuery();
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();
  const deleteMutation = useDeleteClientMutation();

  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [selectedId, setSelectedId] = useState<number | string>(0);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value);

  const openDrawer = (client?: ClientRecord, readOnly = false) => {
    setSelectedClient(client ?? null);
    setIsReadOnly(readOnly);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedClient(null);
    setIsReadOnly(false);
  };

  const openConfirm = (id: number | string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedId, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  const handleSubmit = (values: { name: string; client_key?: string }) => {
    if (selectedClient) {
      updateMutation.mutate(
        { id: selectedClient.id, data: values },
        { onSuccess: closeDrawer },
      );
    } else {
      createMutation.mutate(values, { onSuccess: closeDrawer });
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Stack direction="column" spacing={2.5} width={1} sx={{ flex: 1, minHeight: 0 }}>
        <PageTitle
          title="Client Management"
          searchText={searchText}
          handleInputChange={handleSearch}
          isAddEnable
          btnText="Add Client"
          openModal={() => openDrawer()}
        />

        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            p: 0,
            pb: 0.75,
            width: 1,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0px 4px 24px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          <ClientTable
            rows={clients}
            searchText={searchText}
            isLoading={isLoading}
            onEdit={(row) => openDrawer(row)}
            onDelete={openConfirm}
          />
        </Paper>
      </Stack>

      {/* Delete Confirm */}
      <Popup open={confirmOpen} onClose={() => setConfirmOpen(false)} showOnClose={false}>
        <ConfirmAlert
          title="Are you sure you want to delete this client?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
          isLoading={deleteMutation.isLoading}
        />
      </Popup>

      {/* Create / Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 520 },
            maxWidth: '100vw',
            borderLeft: 0,
            bgcolor: 'background.paper',
          },
        }}
      >
        <ClientForm
          initialValues={selectedClient}
          onSubmit={handleSubmit}
          onCancel={closeDrawer}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
          isReadOnly={isReadOnly}
        />
      </Drawer>
    </>
  );
};

export default ClientSection;
