import Typography from '@mui/material/Typography';

const Footer = () => {
  return (
    <Typography
      mt={0.5}
      px={1}
      pb={{ xs: 3, md: 0 }}
      color="text.secondary"
      variant="body2"
      sx={{ textAlign: { xs: 'center', md: 'right' } }}
      letterSpacing={0.5}
      fontWeight={500}
    >
      {'© 2024 Invictus Global Tech'}
    </Typography>
  );
};

export default Footer;