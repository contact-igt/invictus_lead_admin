import Stack from '@mui/material/Stack';
import ManagementSection from 'components/sections/management';

const UserManagement = () => {
    return (
        <Stack
            direction="column"
            width="100%"
            minHeight="100vh"
            p={3.5}
            spacing={3.5}
            sx={{ flex: 1, minHeight: 0 }}
        >
            <ManagementSection />
        </Stack>
    );
};

export default UserManagement;
