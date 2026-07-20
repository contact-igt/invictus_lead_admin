 
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
import { Drawer } from '@mui/material';

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
            <Stack direction="column" spacing={2.5} width={1}>
                <PageTitle
                    title="User Management"
                    searchText={searchText}
                    handleInputChange={handleInputChange}
                    isAddEnable={user?.role === 'super-admin'}
                    btnText="Add New User"
                    openModal={() => handleOpenFormModal()}
                />
                <Paper
                    sx={{
                        p: 0,
                        pb: 0.75,
                        width: 1,
                        overflow: 'hidden',
                        borderRadius: 3,
                    }}
                >
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
                    sx: {
                        width: { xs: '100vw', sm: 520 },
                        maxWidth: '100vw',
                        borderLeft: 0,
                        bgcolor: 'background.paper',
                    }
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
