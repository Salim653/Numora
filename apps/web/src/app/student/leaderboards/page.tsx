import { LeaderboardsScreen } from '@/features/core-learning/leaderboards';
import { AppShell } from '@/components/shell';
export default function Page() {
  return (
    <AppShell title="Peringkat">
      <LeaderboardsScreen />
    </AppShell>
  );
}
