import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

import { GroupsModule } from './groups/groups.module';
import { CompaniesModule } from './companies/companies.module';
import { FarmsModule } from './farms/farms.module';
import { PlotsModule } from './plots/plots.module';
import { FactoriesModule } from './factories/factories.module';
import { StationsModule } from './stations/stations.module';
import { ProductsModule } from './products/products.module';
import { ProductVarietiesModule } from './product-varieties/product-varieties.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PersonnelModule } from './personnel/personnel.module';
import { GeographyModule } from './geography/geography.module';
import { LegalIdentifierTypesModule } from './legal-identifier-types/legal-identifier-types.module';
import { CulturesModule } from './cultures/cultures.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

import { AgriculturalProjectsModule } from './agricultural-projects/agricultural-projects.module';
import { PlantationsModule } from './plantations/plantations.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { HarvestsModule } from './harvests/harvests.module';
import { ProductionsModule } from './productions/productions.module';
import { ChargesModule } from './charges/charges.module';

import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { PlantMovementsModule } from './plant-movements/plant-movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,

    GroupsModule,
    CompaniesModule,
    FarmsModule,
    PlotsModule,
    FactoriesModule,
    StationsModule,
    ProductsModule,
    ProductVarietiesModule,
    VehiclesModule,
    PersonnelModule,
    GeographyModule,
    LegalIdentifierTypesModule,
    CulturesModule,
    ProfilesModule,
    AuditLogsModule,

    AgriculturalProjectsModule,
    PlantationsModule,
    TreatmentsModule,
    HarvestsModule,
    ProductionsModule,
    ChargesModule,
    PlantMovementsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}