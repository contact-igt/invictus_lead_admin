import Stack from '@mui/material/Stack';
import PixelEyeSection from 'components/sections/pixel-eye';

const PixelEyePage = () => {
    return (
        <Stack direction="column" width="100%" minHeight="100vh" p={3.5} spacing={3.5}>
            <PixelEyeSection />
        </Stack>
    );
};

export default PixelEyePage;
