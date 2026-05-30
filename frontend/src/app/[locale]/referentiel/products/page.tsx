import {ReferentialCrudPage} from '@/components/referential/ReferentialCrudPage';
import {phase2Resources} from '@/lib/phase2-resources';

export default function Page() {
  return (
      <ReferentialCrudPage config={phase2Resources['products']} />
  );
}
