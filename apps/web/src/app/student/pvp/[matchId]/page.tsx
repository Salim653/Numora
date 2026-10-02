import { PvpMatchScreen } from '@/features/pvp/student-pvp';
import { AppShell } from '@/components/shell';
export default function Page() {
  return (
    <AppShell title="Pertandingan PvP" focus>
      <PvpMatchScreen />
    </AppShell>
  );
}
