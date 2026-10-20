import useColorMode from 'hooks/useColorMode';

const SectionDivider = ({ label }: { label: string }) => {
  const { mode } = useColorMode();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: mode === 'dark' ? '#4ADE80' : '#2563EB',
          flexShrink: 0,
        }}
      />
      <h3
        style={{
          fontSize: '1.375rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
          fontFamily: '"Geist", sans-serif',
          margin: 0,
        }}
      >
        {label}
      </h3>
      <div
        style={{
          flex: 1,
          height: 1,
          background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
        }}
      />
    </div>
  );
};

export default SectionDivider;
