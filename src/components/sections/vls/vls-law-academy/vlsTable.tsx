
import { useEffect } from 'react';
import { DataGrid, GridColDef, useGridApiRef, GridApi } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import { Pet } from 'services/user/script';
import ActionMenu from 'components/sections/ActionMenu';
import dayjs from 'dayjs';

interface PetsTableProps {
    searchText: string;
    usersData: [];
    handleRemove: (userId: number) => void;
    handleView: (userId: number) => void;

}

const VlsLawAcademyTable = ({ searchText, usersData, handleRemove, handleView }: PetsTableProps) => {
    const apiRef = useGridApiRef<GridApi>();

    useEffect(() => {
        apiRef.current.setQuickFilterValues(searchText.split(/\b\W+\b/).filter((w) => w));
    }, [apiRef, searchText]);

    const columns: GridColDef<Pet>[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1.5,
            minWidth: 170,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = params?.value;
                return data ? data : "---";
            },
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1.5,
            minWidth: 190,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'mobile',
            headerName: 'Mobile',
            flex: 1.5,
            minWidth: 170,
            align: 'center',
            headerAlign: 'center',
        },

        {
            field: 'message',
            headerName: 'Message',
            flex: 1.5,
            minWidth: 170,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = params?.value;
                return data ? data : "---";
            },

        },
        {
            field: 'registered_date',
            headerName: 'Enquiry Date',
            flex: 1,
            minWidth: 170,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = dayjs(params?.value).format("DD-MM-YYYY");
                return data ? data : "---";
            },
        },
        // {
        //     field: 'time',
        //     headerName: 'Enquiry Time',
        //     flex: 1,
        //     minWidth: 170,
        //     sortable: false,
        //     filterable: false,
        //     align: 'center',
        //     headerAlign: 'center',
        // },


        {
            field: 'ip_address',
            headerName: 'IP Address',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = params?.value;
                return data ? data : "---";
            },
        },
        {
            field: 'utm_source',
            headerName: 'UTM Source',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = params?.value;
                return data ? data : "---";
            },
        },

        {
            field: 'action',
            headerName: 'Actions',
            flex: 1,
            minWidth: 100,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <ActionMenu
                    onRemove={() => { handleRemove(params.row.id) }}
                    onView={() => handleView(params.row.id)}
                />
            ),
        },
    ];

    return (
        <DataGrid
            apiRef={apiRef}
            rows={usersData || []}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            rowHeight={60}
            disableColumnMenu
            disableRowSelectionOnClick
            slots={{ pagination: DataGridFooter }}
            sx={{
                '& .MuiDataGrid-columnHeaderTitle': {
                    overflow: 'visible',
                    textOverflow: 'clip',
                    whiteSpace: 'normal',
                },
                '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                },
            }}
        />
    );
};

export default VlsLawAcademyTable;
