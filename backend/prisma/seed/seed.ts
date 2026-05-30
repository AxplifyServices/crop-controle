import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'password123';
const EMAIL_DOMAIN = 'cropcontrole.com';

const roles = [
  {
    name: 'super_admin',
    description: 'Accès complet à toute la plateforme.',
    isSystemRole: true,
  },
  {
    name: 'admin',
    description: 'Administration des utilisateurs, rôles, structures et paramètres.',
    isSystemRole: true,
  },
  {
    name: 'farmer',
    description: 'Responsable ferme : production, charges, expéditions et KPIs de ses fermes.',
    isSystemRole: true,
  },
  {
    name: 'farm_manager',
    description: 'Responsable des fermiers : supervision des fermes et productions.',
    isSystemRole: true,
  },
  {
    name: 'factory_manager',
    description: 'Responsable usine : réceptions, conditionnement, stocks et KPIs usine.',
    isSystemRole: true,
  },
  {
    name: 'factory_receiver',
    description: 'Récepteur usine : contrôle quantité, qualité et validation réception.',
    isSystemRole: true,
  },
  {
    name: 'conditioning_manager',
    description: 'Responsable conditionnement : sessions, pertes, charges et sorties.',
    isSystemRole: true,
  },
  {
    name: 'orders_manager',
    description: 'Responsable commandes : commandes, retours qualité, factures et paiements.',
    isSystemRole: true,
  },
  {
    name: 'director',
    description: 'Directeur ou profil personnalisé avec accès aux dashboards et entités affectées.',
    isSystemRole: true,
  },
];

const modules = [
  'auth',
  'users',
  'roles',
  'permissions',
  'scopes',
  'groups',
  'companies',
  'farms',
  'plots',
  'factories',
  'stations',
  'cultures',
  'products',
  'product-varieties',
  'vehicles',
  'personnel',
  'agricultural-projects',
  'plantations',
  'treatments',
  'harvests',
  'productions',
  'charges',
  'shipments',
  'receptions',
  'lots',
  'stock',
  'conditioning',
  'clients',
  'orders',
  'quality-returns',
  'exportations',
  'liquidations',
  'invoices',
  'payments',
  'transports',
  'documents',
  'tasks',
  'issues',
  'alerts',
  'notifications',
  'audit-logs',
  'dashboards',
  'reports',
];

const actions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'EXPORT', 'ADMIN'] as const;

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log('Seeding roles...');

  for (const role of roles) {
    await prisma.roles.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
        is_system_role: role.isSystemRole,
        updated_at: new Date(),
      },
      create: {
        name: role.name,
        description: role.description,
        is_system_role: role.isSystemRole,
      },
    });
  }

  console.log('Seeding permissions...');

  for (const moduleName of modules) {
    for (const action of actions) {
      await prisma.permissions.upsert({
        where: {
          module_action: {
            module: moduleName,
            action,
          },
        },
        update: {},
        create: {
          module: moduleName,
          action,
          description: `${action} permission on ${moduleName}`,
        },
      });
    }
  }

  console.log('Assigning permissions to roles...');

  const allPermissions = await prisma.permissions.findMany();
  const roleRecords = await prisma.roles.findMany();

  const superAdmin = roleRecords.find((role) => role.name === 'super_admin');
  const admin = roleRecords.find((role) => role.name === 'admin');

  if (!superAdmin || !admin) {
    throw new Error('System roles were not created correctly.');
  }

  for (const permission of allPermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: superAdmin.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: superAdmin.id,
        permission_id: permission.id,
      },
    });

    if (
      [
        'auth',
        'users',
        'roles',
        'permissions',
        'scopes',
        'groups',
        'companies',
        'farms',
        'plots',
        'factories',
        'stations',
        'cultures',
        'products',
        'product-varieties',
        'vehicles',
        'personnel',
        'documents',
        'audit-logs',
        'dashboards',
        'reports',
      ].includes(permission.module)
    ) {
      await prisma.role_permissions.upsert({
        where: {
          role_id_permission_id: {
            role_id: admin.id,
            permission_id: permission.id,
          },
        },
        update: {},
        create: {
          role_id: admin.id,
          permission_id: permission.id,
        },
      });
    }
  }

  console.log('Seeding users...');

  for (const role of roles) {
    const roleRecord = await prisma.roles.findUnique({
      where: {
        name: role.name,
      },
    });

    if (!roleRecord) {
      continue;
    }

    const email = `${role.name}@${EMAIL_DOMAIN}`;

    await prisma.users.upsert({
      where: {
        email,
      },
      update: {
        password_hash: passwordHash,
        role_id: roleRecord.id,
        status: 'ACTIVE',
        updated_at: new Date(),
      },
      create: {
        email,
        password_hash: passwordHash,
        first_name: role.name,
        last_name: 'CropControle',
        phone: null,
        status: 'ACTIVE',
        role_id: roleRecord.id,
      },
    });

    console.log(`User ready: ${email} / ${PASSWORD}`);
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });