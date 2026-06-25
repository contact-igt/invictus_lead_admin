import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, useGridApiRef, GridApi } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import ActionMenu from 'components/sections/ActionMenu';
import { Chip } from '@mui/material';
import { useAuth } from 'redux/selectors/auth/authSelector';

interface ManagementTableProps {
    searchText: string;
    usersData: any[];
    handleRemove: (userId: number | string) => void;
    handleEdit: (user: any) => void;
    handleView: (user: any) => void;
}

const ManagementTable = ({ searchText, usersData, handleRemove, handleEdit, handleView }: ManagementTableProps) => {
    const apiRef = useGridApiRef<GridApi>();
    const { user: authUser } = useAuth();
    const isSuperAdmin = authUser?.role === 'super-admin';

    useEffect(() => {
        if (apiRef.current?.setQuickFilterValues) {
            apiRef.current.setQuickFilterValues(searchText.trim().split(/\s+/).filter(Boolean));
        }
    }, [searchText]);

    const columns: GridColDef[] = [
        {
            field: 'username',
            headerName: 'Username',
            flex: 1.5,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 2,
            minWidth: 200,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'role',
            headerName: 'Role',
            flex: 1,
            minWidth: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'super-admin' ? 'secondary' : params.value === 'admin' ? 'primary' : 'default'}
                />
            ),
        },
        {
            field: 'client',
            headerName: 'Client',
            flex: 1.5,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (_value: any, row: any) => row?.client?.name || null,
            renderCell: (params) => params.value || <span style={{ color: 'rgba(0,0,0,0.3)' }}>—</span>,
        },
        {
            field: 'mobile',
            headerName: 'Mobile',
            flex: 1.5,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
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
                    onRemove={isSuperAdmin ? () => handleRemove(params.row.id) : undefined}
                    onEdit={isSuperAdmin ? () => handleEdit(params.row) : undefined}
                    onView={() => handleView(params.row)}
                />
            ),
        },
    ];

    return (
        <Box sx={{ height: '100%', minHeight: 0, width: 1 }}>
            <DataGrid
                apiRef={apiRef}
                rows={usersData || []}
                columns={columns}
                autoHeight
                pageSizeOptions={[5, 10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                rowHeight={60}
                disableColumnMenu
                disableRowSelectionOnClick
                slots={{ pagination: DataGridFooter }}
                sx={{
                    border: 0,
                    '& .MuiDataGrid-columnHeaderTitle': {
                        overflow: 'visible',
                        textOverflow: 'clip',
                        whiteSpace: 'normal',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        borderBottomColor: 'divider',
                        backgroundColor: 'rgba(21, 106, 69, 0.04)',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(21, 106, 69, 0.04)',
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                    },
                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                        outline: 'none',
                    },
                }}
            />
        </Box>
    );
};

export default ManagementTable;
