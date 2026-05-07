/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ChangeEvent } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import { useDeleteVlsLawAcademyByIdMutation, useVlsLawAcademyQuery } from 'components/hooks/useVlsQuery';
import VlsLawAcademyTable from './vlsTable';
import { handleCSVDownloadData, handleXlsxDownloadData } from 'components/hooks/useExportDataToExcel';
import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import VlsAcademyView from './vlsAcademyView';

const VlsLawAcademySection = () => {
    const { data: usersData, isLoading } = useVlsLawAcademyQuery();
    const { mutate: deleteVlsLawAcademyUserMutate, isLoading: deleteLoading } = useDeleteVlsLawAcademyByIdMutation();
    const [searchText, setSearchText] = useState('');
    const [openConfirmAlertModal, setOpenConfirmAlertModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const [viewModal, setviewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };
    const handleOpenConfirmAlertModal = (id: number) => {
        setSelectedUserId(id);
        setOpenConfirmAlertModal(true);
    }
    const handleRemoveTip = () => {
        deleteVlsLawAcademyUserMutate({
            id: selectedUserId
        }, {
            onSuccess: () => {
                setOpenConfirmAlertModal(false)
            }
        })
    }
    const handleOpenViewModal = (id: number) => {
        const user = usersData?.data?.find((user: any) => user.id === id);
        setviewModal(!viewModal);
        setviewModal(!viewModal);
        setSelectedUser(user);
    }

    const handleCloseViewModal = () => {
        setviewModal(false);
        setSelectedUser(null);
    }

    if (isLoading) return <PageLoader />;

    // console.log("sss" , usersData)

    return (
        <>
            <Stack direction="column" spacing={1} width={1}>
                <PageTitle
                    title="Vls Law Academy Users"
                    btnText="Vls Law Academy Users"
                    searchText={searchText}
                    handleInputChange={handleInputChange}
                    isCsvExportEnable={usersData?.data?.length > 0}
                    isXslxExportEnable={usersData?.data?.length > 0}
                    handleXslxExportData={() => handleXlsxDownloadData(usersData?.data, "vls-law-academy")}
                    handleCsvExportData={() => handleCSVDownloadData(usersData?.data, "vls-law-academy")}
                />
                <Paper sx={{ mt: 1.5, p: 0, pb: 0.75, minHeight: 411, width: 1 }}>
                    <VlsLawAcademyTable
                        searchText={searchText}
                        usersData={usersData?.data}
                        handleRemove={(id) => handleOpenConfirmAlertModal(id)}
                        handleView={(id) => handleOpenViewModal(id)}
                    />
                </Paper>
            </Stack>
            <Popup
                open={openConfirmAlertModal}
                onClose={() => setOpenConfirmAlertModal(false)}
                showOnClose={false}
            >
                <ConfirmAlert
                    title={`Are you sure you want to delete this user ?`}
                    onConfirm={handleRemoveTip}
                    onCancel={() => setOpenConfirmAlertModal(false)}
                    isLoading={deleteLoading}
                />
            </Popup>

            <Popup open={viewModal} onClose={handleCloseViewModal}>
               <VlsAcademyView selectedUser={selectedUser} />
            </Popup>
        </>
    );
};

export default VlsLawAcademySection;
