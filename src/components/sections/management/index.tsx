/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import {
    useManagementQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation
} from 'components/hooks/useManagementQuery';
import ManagementTable from './ManagementTable';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import UserForm from './UserForm';
import { Box, Button, Drawer } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const ManagementSection = () => {
    const { user } = useAuth();
    const { data: usersData, isLoading } = useManagementQuery();
    const createMutation = useCreateUserMutation();
    const updateMutation = useUpdateUserMutation();
    const deleteMutation = useDeleteUserMutation();

    const [searchText, setSearchText] = useState('');
    const [openConfirmAlertModal, setOpenConfirmAlertModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | string>(0);
    const [openFormModal, setOpenFormModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleOpenConfirmAlertModal = (id: number | string) => {
        setSelectedUserId(id);
        setOpenConfirmAlertModal(true);
    };

    const handleRemoveUser = () => {
        deleteMutation.mutate(selectedUserId, {
            onSuccess: () => {
                setOpenConfirmAlertModal(false);
            }
        });
    };

    const handleOpenFormModal = (user?: any, viewOnly: boolean = false) => {
        if (user) {
            setSelectedUser({
                ...user,
                client_key: user.client?.client_key || user.client_key || '',
            });
        } else {
            setSelectedUser(null);
        }
        setIsReadOnly(viewOnly);
        setOpenFormModal(true);
    };

    const handleCloseFormModal = () => {
        setOpenFormModal(false);
        setSelectedUser(null);
        setIsReadOnly(false);
    };

    const handleFormSubmit = (values: any) => {
        if (selectedUser) {
            updateMutation.mutate({ id: selectedUser.id, data: values }, {
                onSuccess: () => handleCloseFormModal()
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: () => handleCloseFormModal()
            });
        }
    };

    if (isLoading) return <PageLoader />;

    return (
        <>
            <Stack direction="column" spacing={1} width={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <PageTitle
                        title="User Management"
                        searchText={searchText}
                        handleInputChange={handleInputChange}
                    />
                    {user?.role === 'super-admin' && (
                        <Button
                            variant="contained"
                            startIcon={<IconifyIcon icon="mingcute:user-add-line" />}
                            onClick={() => handleOpenFormModal()}
                            sx={{ height: 45 }}
                        >
                            Add New User
                        </Button>
                    )}
                </Box>
                <Paper sx={{ mt: 1.5, p: 0, pb: 0.75, minHeight: 411, width: 1 }}>
                    <ManagementTable
                        searchText={searchText}
                        usersData={usersData?.data}
                        handleRemove={(id) => handleOpenConfirmAlertModal(id)}
                        handleEdit={(user) => handleOpenFormModal(user)}
                        handleView={(user) => handleOpenFormModal(user, true)}
                    />
                </Paper>
            </Stack>

            <Popup open={openConfirmAlertModal} onClose={() => setOpenConfirmAlertModal(false)} showOnClose={false}>
                <ConfirmAlert
                    title={`Are you sure you want to delete this user?`}
                    onConfirm={handleRemoveUser}
                    onCancel={() => setOpenConfirmAlertModal(false)}
                    isLoading={deleteMutation.isLoading}
                />
            </Popup>

            <Drawer
                anchor="right"
                open={openFormModal}
                onClose={handleCloseFormModal}
                PaperProps={{
                    sx: { width: { xs: '100vw', sm: 500 }, borderLeft: 0 }
                }}
            >
                <UserForm
                    initialValues={selectedUser}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseFormModal}
                    isLoading={createMutation.isLoading || updateMutation.isLoading}
                    isReadOnly={isReadOnly}
                />
            </Drawer>
        </>
    );
};

export default ManagementSection;
