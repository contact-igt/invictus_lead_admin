
import { useEffect } from 'react';
import { DataGrid, GridColDef, useGridApiRef, GridApi } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import ActionMenu from 'components/sections/ActionMenu';
import dayjs from 'dayjs';
import { VlsAibe } from 'services/vls/script';
import { Chip, Stack } from '@mui/material';

interface PetsTableProps {
    searchText: string;
    usersData: VlsAibe[];
    handleRemove: (userId: number) => void;
    handleView: (userId: number) => void;

}

const VlsAibeTable = ({ searchText, usersData, handleRemove, handleView }: PetsTableProps) => {
    const apiRef = useGridApiRef<GridApi>();

    useEffect(() => {
        apiRef.current.setQuickFilterValues(searchText.split(/\b\W+\b/).filter((w) => w));
    }, [apiRef, searchText]);

    const columns: GridColDef<VlsAibe>[] = [
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
            minWidth: 120,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1.5,
            minWidth: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return params.value ? `₹${params.value}` : "-"
            }
        },
        {
            field: 'programm_start_date',
            headerName: 'Start Date',
            flex: 1.5,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = dayjs(params?.value).format("YYYY-MMM-DD")
                return data ? data : "-"
            }
        },

        {
            field: 'programm_end_date',
            headerName: 'End Date',
            flex: 1.5,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = dayjs(params?.value).format("YYYY-MMM-DD")
                return data ? data : "-"
            }
        },

        {
            field: 'registered_date',
            headerName: 'Registered Date',
            flex: 1.5,
            minWidth: 180,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const data = dayjs(params?.value).format("YYYY-MMM-DD")
                return data ? data : "-"
            }
        },

        {
            field: 'payment_status',
            headerName: 'Payment Status',
            flex: 1.5,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const color = params.value === 'paid' ? 'success' : 'error';
                return (
                    <Stack direction="column" alignItems="center" justifyContent="center" height={1}>
                        <Chip label={params.value ? params?.value : "failed"} size="small" color={color} />
                    </Stack>
                );
            }
        },
        {
            field: 'razorpay_payment_id',
            headerName: 'Razorpay Payment ID',
            flex: 1.5,
            minWidth: 220,
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
                    onView={() => { handleView(params.row.id) }}
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

export default VlsAibeTable;
