import {ReferentialCrudPage} from '@/components/referential/ReferentialCrudPage';
import {phase3Resources} from '@/lib/phase3-resources';

export default function Page() {
  return <ReferentialCrudPage config={phase3Resources.productions} />;
}