import { PvpScreen } from '@/features/pvp/student-pvp';
import { AppShell } from '@/components/shell';
export default function Page() {
  return (
    <AppShell title="PvP">
      <PvpScreen />
    </AppShell>
  );
}
