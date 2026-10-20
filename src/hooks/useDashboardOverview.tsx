import { useMemo } from 'react';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { ClientRegistry } from 'config/clients';
import { getClientHomePath, resolveClientModuleKey } from 'utils/clientModuleResolver';
import { useAaravEyeCareSummary } from './useAaravEyeCareQuery';
import { useRioSummary } from './useRioQuery';
import { useShantiEyeTechSummary } from './useShantiEyeTechQuery';
import { usePhoenixFitnessSummary } from './usePhoenixFitnessQuery';
import { useAntardrashtiNetralayaSummary } from './useAntardrashtiNetralayaQuery';

export interface ClientModuleCard {
  key: string;
  name: string;
  color: string;
  path: string;
  icon: string;
  description: string;
  totalLeads: number | null;
  todayLeads: number | null;
  thisMonthLeads: number | null;
  loading: boolean;
}

// Modules without a lightweight summary endpoint (PixelEye, VLS Law) are shown
// as navigation-only cards rather than fabricating a lead count for them.
const MODULE_ICONS: Record<string, string> = {
  pixeleye: 'solar:eye-linear',
  aarav_eye_care: 'solar:eye-linear',
  rio: 'solar:heart-pulse-linear',
  shanti_eye_tech: 'solar:eye-linear',
  phoenix_fitness: 'solar:dumbbell-linear',
  antardrashti_netralaya: 'solar:eye-linear',
  vls_law: 'solar:document-text-linear',
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  pixeleye: 'Voice lead capture & call follow-ups',
  aarav_eye_care: 'Eye care appointment leads',
  rio: 'Rio brand lead intake',
  shanti_eye_tech: 'Eye care appointment leads',
  phoenix_fitness: 'Fitness membership leads',
  antardrashti_netralaya: 'Eye care appointment leads',
  vls_law: 'Legal case intake & enrollment',
};

export const useDashboardOverview = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';
  const myModuleKey = resolveClientModuleKey(user?.clientKey);
  const wants = (key: string) => isSuperAdmin || myModuleKey === key;

  const aarav = useAaravEyeCareSummary('aarav_eye_care', {}, wants('aarav_eye_care'));
  const rio = useRioSummary('rio', {}, wants('rio'));
  const shanti = useShantiEyeTechSummary('shanti_eye_tech', {}, wants('shanti_eye_tech'));
  const phoenix = usePhoenixFitnessSummary('phoenix_fitness', {}, wants('phoenix_fitness'));
  const antardrashti = useAntardrashtiNetralayaSummary(
    'antardrashti_netralaya',
    {},
    wants('antardrashti_netralaya'),
  );

  const summaryByKey: Record<string, { data?: { data: { total_leads: number; today_leads: number; this_month_leads: number } }; isLoading: boolean }> = {
    aarav_eye_care: aarav,
    rio,
    shanti_eye_tech: shanti,
    phoenix_fitness: phoenix,
    antardrashti_netralaya: antardrashti,
  };

  const allModuleKeys = Object.keys(ClientRegistry);
  const visibleModuleKeys = isSuperAdmin
    ? allModuleKeys
    : allModuleKeys.filter((key) => key === myModuleKey);

  const modules: ClientModuleCard[] = useMemo(
    () =>
      visibleModuleKeys.map((key) => {
        const config = ClientRegistry[key];
        const summary = summaryByKey[key];
        const s = summary?.data?.data;
        return {
          key,
          name: config.appName,
          color: config.theme.primaryColor,
          path: getClientHomePath(key),
          icon: MODULE_ICONS[key] || 'solar:widget-4-linear',
          description: MODULE_DESCRIPTIONS[key] || 'Client lead management',
          totalLeads: s?.total_leads ?? null,
          todayLeads: s?.today_leads ?? null,
          thisMonthLeads: s?.this_month_leads ?? null,
          loading: summary?.isLoading ?? false,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      visibleModuleKeys.join(','),
      aarav.data,
      rio.data,
      shanti.data,
      phoenix.data,
      antardrashti.data,
      aarav.isLoading,
      rio.isLoading,
      shanti.isLoading,
      phoenix.isLoading,
      antardrashti.isLoading,
    ],
  );

  const summaryQueries = [aarav, rio, shanti, phoenix, antardrashti];

  const aggregate = useMemo(() => {
    const withData = summaryQueries.filter((q) => q.data?.data);
    const totals = withData.reduce(
      (acc, q) => {
        const d = q.data!.data;
        acc.total += d.total_leads || 0;
        acc.today += d.today_leads || 0;
        acc.month += d.this_month_leads || 0;
        return acc;
      },
      { total: 0, today: 0, month: 0 },
    );
    return {
      ...totals,
      isLoading: isSuperAdmin && summaryQueries.some((q) => q.isLoading),
      moduleCount: allModuleKeys.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aarav.data, rio.data, shanti.data, phoenix.data, antardrashti.data, aarav.isLoading, rio.isLoading, shanti.isLoading, phoenix.isLoading, antardrashti.isLoading]);

  return { isSuperAdmin, myModuleKey, modules, aggregate, user };
};

export default useDashboardOverview;
