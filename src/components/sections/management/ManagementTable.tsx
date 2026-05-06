import { useEffect } from 'react';
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
            apiRef.current.setQuickFilterValues(searchText.split(/\b\W+\b/).filter(Boolean));
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
        <DataGrid
            apiRef={apiRef}
            rows={usersData || []}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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

export default ManagementTable;
