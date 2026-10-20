import { useNavigate } from 'react-router-dom';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import paths from 'routes/paths';

const LINKS = [
  {
    label: 'Client Management',
    description: 'Onboard and configure client accounts',
    icon: 'hugeicons:building-03',
    path: paths.clients,
  },
  {
    label: 'User Management',
    description: 'Manage admin & client user access',
    icon: 'hugeicons:user-group-active',
    path: paths.management,
  },
  {
    label: 'API Logs',
    description: 'Inspect request activity & failures',
    icon: 'hugeicons:activity-04',
    path: paths.apiLogs,
  },
];

const AdminQuickLinks = () => {
  const { mode } = useColorMode();
  const navigate = useNavigate();
  const cardBg = mode === 'dark' ? '#0B1410' : '#FFFFFF';
  const cardBorder = mode === 'dark' ? '#15271E' : '#E5E7EB';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {LINKS.map((link) => (
        <div
          key={link.path}
          role="button"
          tabIndex={0}
          onClick={() => navigate(link.path)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate(link.path);
          }}
          style={{
            borderRadius: 18,
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: mode === 'dark' ? 'rgba(34,197,94,0.1)' : '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconifyIcon
              icon={link.icon}
              width={18}
              height={18}
              sx={{ color: `${mode === 'dark' ? '#4ADE80' : '#16A34A'} !important` }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                fontFamily: '"Geist", sans-serif',
              }}
            >
              {link.label}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: mode === 'dark' ? '#94A3B8' : '#64748B',
                fontFamily: '"Geist", sans-serif',
              }}
            >
              {link.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminQuickLinks;
