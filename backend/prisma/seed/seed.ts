import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed structurel uniquement.
 *
 * Objectif :
 * - créer les permissions nécessaires à l'application ;
 * - créer le rôle super_admin si absent ;
 * - rattacher toutes les permissions au rôle super_admin ;
 * - NE PAS créer d'utilisateurs de démonstration ;
 * - NE PAS créer tous les profils admin/farmer/director/etc.
 */

const modules = [
  /**
   * Administration / sécurité
   */
  'profiles',
  'users',
  'roles',
  'permissions',
  'scopes',
  'audit-logs',

  /**
   * Référentiel organisationnel actuel
   */
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

  /**
   * Référentiels techniques actuels
   */
  'geography',
  'legal-identifier-types',

  /**
   * Pilotage actuel
   */
  'dashboards',
] as const;

const actions = [
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'VALIDATE',
  'EXPORT',
  'ADMIN',
] as const;

async function main() {
  console.log('Seeding structural permissions only...');

  const superAdminRole = await prisma.roles.upsert({
    where: {
      name: 'super_admin',
    },
    update: {
      description: 'Accès complet à toute la plateforme.',
      is_system_role: true,
      updated_at: new Date(),
    },
    create: {
      name: 'super_admin',
      description: 'Accès complet à toute la plateforme.',
      is_system_role: true,
    },
  });

  console.log('Super admin role ready.');

  for (const moduleName of modules) {
    for (const action of actions) {
      await prisma.permissions.upsert({
        where: {
          module_action: {
            module: moduleName,
            action,
          },
        },
        update: {
          description: `${action} permission on ${moduleName}`,
        },
        create: {
          module: moduleName,
          action,
          description: `${action} permission on ${moduleName}`,
        },
      });
    }
  }

  console.log('Permissions ready.');

  const permissions = await prisma.permissions.findMany({
    where: {
      module: {
        in: [...modules],
      },
    },
  });

  for (const permission of permissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: superAdminRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        permission_id: permission.id,
      },
    });
  }

  console.log('All structural permissions assigned to super_admin role.');
  console.log('Seed completed without demo users.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });