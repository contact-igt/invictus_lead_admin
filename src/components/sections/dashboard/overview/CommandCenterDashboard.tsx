import { Box } from '@mui/material';
import { PixelEyePageShell, PixelEyePageHeader } from 'components/sections/pixel-eye/pixelEyeUi';
import DarkKPICards from 'components/sections/pixel-eye-overview/dark/DarkKPICards';
import type { KPIItem } from 'components/sections/pixel-eye-overview/types';
import useDashboardOverview from 'hooks/useDashboardOverview';
import SectionDivider from './SectionDivider';
import ClientModuleCard from './ClientModuleCard';
import AdminQuickLinks from './AdminQuickLinks';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const CommandCenterDashboard = () => {
  const { isSuperAdmin, modules, aggregate, user } = useDashboardOverview();

  const aggregateKpiItems: KPIItem[] = [
    {
      key: 'total-leads',
      label: 'Total Leads',
      value: aggregate.total,
      icon: 'solar:users-group-two-rounded-linear',
      color: 'primary',
      comparisonText: 'Across all reporting modules',
    },
    {
      key: 'today-leads',
      label: 'New Today',
      value: aggregate.today,
      icon: 'solar:calendar-mark-linear',
      color: 'success',
      comparisonText: 'Captured in the last 24h',
    },
    {
      key: 'month-leads',
      label: 'This Month',
      value: aggregate.month,
      icon: 'solar:chart-2-linear',
      color: 'info',
      comparisonText: 'Month-to-date volume',
    },
    {
      key: 'active-modules',
      label: 'Client Modules',
      value: aggregate.moduleCount,
      icon: 'solar:widget-4-linear',
      color: 'warning',
      comparisonText: 'Verticals live on the platform',
    },
  ];

  return (
    <PixelEyePageShell>
      <PixelEyePageHeader
        eyebrow="COMMAND CENTER"
        title={`${getGreeting()}, ${user?.username || 'there'}`}
        subtitle={
          isSuperAdmin
            ? 'Cross-client lead intelligence across every Invictus vertical, in one place.'
            : "Here's a snapshot of your workspace."
        }
      />

      {isSuperAdmin && (
        <Box sx={{ mb: 4 }}>
          <SectionDivider label="Network Overview" />
          <DarkKPICards items={aggregateKpiItems} loading={aggregate.isLoading} />
        </Box>
      )}

      <Box sx={{ mb: isSuperAdmin ? 4 : 0 }}>
        <SectionDivider label={isSuperAdmin ? 'Client Modules' : 'Your Workspace'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module, index) => (
            <ClientModuleCard key={module.key} module={module} index={index} />
          ))}
        </div>
      </Box>

      {isSuperAdmin && (
        <Box>
          <SectionDivider label="Administration" />
          <AdminQuickLinks />
        </Box>
      )}
    </PixelEyePageShell>
  );
};

export default CommandCenterDashboard;
