import { useNavigate } from 'react-router-dom';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import type { ClientModuleCard as ClientModuleCardData } from 'hooks/useDashboardOverview';

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const StatBlock = ({ label, value }: { label: string; value: number }) => {
  const { mode } = useColorMode();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          fontFamily: '"Geist Mono", monospace',
          color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
          lineHeight: 1.1,
        }}
      >
        {value.toLocaleString()}
      </span>
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: mode === 'dark' ? '#94A3B8' : '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
    </div>
  );
};

const ClientModuleCard = ({ module, index }: { module: ClientModuleCardData; index: number }) => {
  const { mode } = useColorMode();
  const navigate = useNavigate();
  const hasLiveData = module.totalLeads !== null;

  const cardBg = mode === 'dark' ? '#0B1410' : '#FFFFFF';
  const cardBorder = mode === 'dark' ? '#15271E' : '#E5E7EB';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(module.path)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(module.path);
        }
      }}
      style={{
        borderRadius: 18,
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        animation: 'kpiSlideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        animationDelay: `${index * 45}ms`,
      }}
      className="client-module-card"
    >
      <style>{`
        .client-module-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(15,23,42,0.08); }
        @keyframes kpiSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: hexToRgba(module.color, mode === 'dark' ? 0.16 : 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon={module.icon} width={20} height={20} sx={{ color: `${module.color} !important` }} />
        </div>
        <IconifyIcon
          icon="solar:arrow-right-up-linear"
          width={16}
          height={16}
          sx={{ color: `${mode === 'dark' ? '#4B6356' : '#94A3B8'} !important` }}
        />
      </div>

      <div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
            fontFamily: '"Geist", sans-serif',
            letterSpacing: '-0.01em',
            marginBottom: 4,
          }}
        >
          {module.name}
        </div>
        <div
          style={{
            fontSize: '0.8125rem',
            color: mode === 'dark' ? '#94A3B8' : '#64748B',
            fontFamily: '"Geist", sans-serif',
            lineHeight: 1.4,
          }}
        >
          {module.description}
        </div>
      </div>

      {hasLiveData ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            paddingTop: 14,
            borderTop: `1px solid ${mode === 'dark' ? '#15271E' : '#F1F5F9'}`,
          }}
        >
          {module.loading ? (
            <span style={{ fontSize: '0.75rem', color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>Loading…</span>
          ) : (
            <>
              <StatBlock label="Total" value={module.totalLeads ?? 0} />
              <StatBlock label="Today" value={module.todayLeads ?? 0} />
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingTop: 14,
            borderTop: `1px solid ${mode === 'dark' ? '#15271E' : '#F1F5F9'}`,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: module.color,
          }}
        >
          Open module
        </div>
      )}
    </div>
  );
};

export default ClientModuleCard;
