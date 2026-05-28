const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'src', 'app', '[locale]', 'referentiel');

const resources = [
  'groups',
  'companies',
  'farms',
  'plots',
  'factories',
  'stations',
  'products',
  'product-varieties',
  'vehicles',
  'personnel'
];

for (const resource of resources) {
  const dir = path.join(root, resource);

  fs.mkdirSync(dir, {recursive: true});

  const content = `import {ReferentialCrudPage} from '@/components/referential/ReferentialCrudPage';
import {phase2Resources} from '@/lib/phase2-resources';

export default function Page() {
  return <ReferentialCrudPage config={phase2Resources['${resource}']} />;
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(\`Generated referentiel/\${resource}/page.tsx\`);
}