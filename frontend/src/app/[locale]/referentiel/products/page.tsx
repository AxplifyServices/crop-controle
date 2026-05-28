import {AppShell} from '@/components/layout/AppShell';
import {ReferentialCrudPage} from '@/components/referential/ReferentialCrudPage';
import {phase2Resources} from '@/lib/phase2-resources';

export default function Page() {
  return (
    <AppShell>
      <ReferentialCrudPage config={phase2Resources['products']} />
    </AppShell>
  );
}
