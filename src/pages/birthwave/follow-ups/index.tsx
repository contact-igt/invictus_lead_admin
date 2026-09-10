import { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveLeadsQuery } from 'components/hooks/useBirthwaveQuery';
import { BirthwaveLead } from 'services/birthwave';
import PortalPageHeader from '../PortalPageHeader';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';

const dayDiff = (value: string) => {
  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

interface GroupProps {
  title: string;
  tone: { bg: string; fg: string };
  leads: BirthwaveLead[];
}

const Group = ({ title, tone, leads }: GroupProps) => (
  <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden', mb: 2.5 }}>
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK }}>{title}</Typography>
      <Chip label={leads.length} size="small" sx={{ bgcolor: tone.bg, color: tone.fg, fontWeight: 700, fontSize: '0.7rem' }} />
    </Stack>
    {leads.length === 0 ? (
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>Nothing here.</Typography>
      </Box>
    ) : (
      leads.map((lead, index) => (
        <Stack
          key={lead.id}
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ px: 3, py: 1.75, borderTop: index === 0 ? 'none' : '1px solid', borderColor: CARD_BORDER }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK }}>{lead.name}</Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: TEXT_MUTED }}>{lead.phone || '—'} · {lead.service || 'General enquiry'}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: tone.fg }}>
            {lead.next_follow_up ? formatDate(lead.next_follow_up) : '—'}
          </Typography>
        </Stack>
      ))
    )}
  </Box>
);

const FollowUpsPage = () => {
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const { data, isLoading } = useBirthwaveLeadsQuery(
    scopedClientKey,
    { limit: 100 },
    { enabled: hasScope },
  );

  const leadsWithFollowUp = useMemo(() => (data?.data ?? []).filter((lead) => lead.next_follow_up), [data]);

  const { overdue, today, upcoming } = useMemo(() => {
    const groups = { overdue: [] as BirthwaveLead[], today: [] as BirthwaveLead[], upcoming: [] as BirthwaveLead[] };
    leadsWithFollowUp.forEach((lead) => {
      const diff = dayDiff(lead.next_follow_up as string);
      if (diff < 0) groups.overdue.push(lead);
      else if (diff === 0) groups.today.push(lead);
      else groups.upcoming.push(lead);
    });
    const byDate = (a: BirthwaveLead, b: BirthwaveLead) =>
      new Date(a.next_follow_up as string).getTime() - new Date(b.next_follow_up as string).getTime();
    groups.overdue.sort(byDate);
    groups.upcoming.sort(byDate);
    return groups;
  }, [leadsWithFollowUp]);

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title="Follow-ups" subtitle="Every lead with a scheduled follow-up, grouped by urgency" />

      {isLoading ? (
        <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
      ) : (
        <>
          <Group title="Overdue" tone={{ bg: 'var(--bw-tint-red)', fg: '#EF4444' }} leads={overdue} />
          <Group title="Today" tone={{ bg: 'var(--bw-tint-amber)', fg: '#F59E0B' }} leads={today} />
          <Group title="Upcoming" tone={{ bg: 'var(--bw-tint-blue)', fg: '#2563EB' }} leads={upcoming} />
        </>
      )}
    </Box>
  );
};

export default FollowUpsPage;
