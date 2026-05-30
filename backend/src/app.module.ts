import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  ],
})
export class AppModule {}