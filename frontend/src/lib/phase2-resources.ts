import {cityOptionsByRegion, countryOptions, regionOptionsByCountry} from '@/lib/geo-options';

export type FieldType = 'text' | 'number' | 'select' | 'lookup' | 'multiselect';

export type ResourceOption = {
  labelKey: string;
  value: string;
};

export type ResourceField = {
  key: string;
  labelKey: string;
  type: FieldType;
  required?: boolean;
  persist?: boolean;
  options?: ResourceOption[];
  lookup?: {
    endpoint: string;
    valueKey: string;
    labelKeys: string[];
    scopeEntityType?: string;
    excludeCurrentRecord?: boolean;
  };
  dependsOn?: {
    fieldKey: string;
    optionsByValue: Record<string, ResourceOption[]>;
  };
};

export type ResourceConfig = {
  module: string;
  titleKey: string;
  descriptionKey: string;
  endpoint: string;
  listFields: string[];
  fields: ResourceField[];
};

const statusOptions = [
  {labelKey: 'options.status.ACTIVE', value: 'ACTIVE'},
  {labelKey: 'options.status.INACTIVE', value: 'INACTIVE'},
  {labelKey: 'options.status.ARCHIVED', value: 'ARCHIVED'}
];

const cultureOptions = [
  {labelKey: 'options.culture.STRAWBERRY', value: 'STRAWBERRY'},
  {labelKey: 'options.culture.BLUEBERRY', value: 'BLUEBERRY'},
  {labelKey: 'options.culture.RASPBERRY', value: 'RASPBERRY'},
  {labelKey: 'options.culture.BLACKBERRY', value: 'BLACKBERRY'},
  {labelKey: 'options.culture.MIXED', value: 'MIXED'},
  {labelKey: 'options.culture.OTHER', value: 'OTHER'}
];

const stationFeatureOptions = [
  {
    labelKey: 'options.stationFeature.SORTING_CALIBRATION',
    value: 'SORTING_CALIBRATION'
  },
  {
    labelKey: 'options.stationFeature.PACKAGING',
    value: 'PACKAGING'
  },
  {
    labelKey: 'options.stationFeature.FREEZING',
    value: 'FREEZING'
  }
];

export const phase2Resources: Record<string, ResourceConfig> = {
  groups: {
    module: 'groups',
    titleKey: 'resources.groups.title',
    descriptionKey: 'resources.groups.description',
    endpoint: '/groups',
    listFields: ['name', 'description'],
    fields: [
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'description', labelKey: 'fields.description', type: 'text'}
    ]
  },

  companies: {
    module: 'companies',
    titleKey: 'resources.companies.title',
    descriptionKey: 'resources.companies.description',
    endpoint: '/companies',
    listFields: ['name', 'code', 'country', 'region', 'city', 'status'],
    fields: [
      {
        key: 'group_id',
        labelKey: 'fields.groupId',
        type: 'lookup',
        required: true,
        lookup: {
          endpoint: '/groups',
          valueKey: 'id',
          labelKeys: ['name'],
          scopeEntityType: 'GROUP'
        }
      },
      {
        key: 'parent_id',
        labelKey: 'fields.parentCompanyId',
        type: 'lookup',
        lookup: {
          endpoint: '/companies',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'COMPANY',
          excludeCurrentRecord: true
        }
      },

      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'legal_name', labelKey: 'fields.legalName', type: 'text'},
      {key: 'code', labelKey: 'fields.codeInternal', type: 'text'},

      {
        key: 'country',
        labelKey: 'fields.country',
        type: 'select',
        options: countryOptions,
        required: true
      },

      {
        key: 'ice',
        labelKey: 'fields.ice',
        type: 'text',
        visibleWhen: {
          fieldKey: 'country',
          values: ['Maroc']
        },
        labelKeyByValue: {
          fieldKey: 'country',
          labelsByValue: {
            Maroc: 'fields.iceMorocco'
          }
        }
      },
      {
        key: 'tax_id',
        labelKey: 'fields.taxId',
        type: 'text',
        visibleWhen: {
          fieldKey: 'country',
          values: ['Maroc', 'Espagne']
        },
        labelKeyByValue: {
          fieldKey: 'country',
          labelsByValue: {
            Maroc: 'fields.taxIdMorocco',
            Espagne: 'fields.taxIdSpain'
          }
        }
      },
      {
        key: 'rc',
        labelKey: 'fields.rc',
        type: 'text',
        visibleWhen: {
          fieldKey: 'country',
          values: ['Maroc', 'Espagne']
        },
        labelKeyByValue: {
          fieldKey: 'country',
          labelsByValue: {
            Maroc: 'fields.rcMorocco',
            Espagne: 'fields.rcSpain'
          }
        }
      },
      {
        key: 'cnss',
        labelKey: 'fields.cnss',
        type: 'text',
        visibleWhen: {
          fieldKey: 'country',
          values: ['Maroc', 'Espagne']
        },
        labelKeyByValue: {
          fieldKey: 'country',
          labelsByValue: {
            Maroc: 'fields.cnssMorocco',
            Espagne: 'fields.socialSecuritySpain'
          }
        }
      },
      {
        key: 'patente',
        labelKey: 'fields.patente',
        type: 'text',
        visibleWhen: {
          fieldKey: 'country',
          values: ['Maroc', 'Espagne']
        },
        labelKeyByValue: {
          fieldKey: 'country',
          labelsByValue: {
            Maroc: 'fields.patenteMorocco',
            Espagne: 'fields.iaeSpain'
          }
        }
      },

      {key: 'address', labelKey: 'fields.address', type: 'text'},

      {
        key: 'region',
        labelKey: 'fields.region',
        type: 'select',
        dependsOn: {
          fieldKey: 'country',
          optionsByValue: regionOptionsByCountry
        }
      },
      {
        key: 'city',
        labelKey: 'fields.city',
        type: 'select',
        dependsOn: {
          fieldKey: 'region',
          optionsByValue: cityOptionsByRegion
        }
      },

      {key: 'latitude', labelKey: 'fields.latitude', type: 'number'},
      {key: 'longitude', labelKey: 'fields.longitude', type: 'number'},
      {
        key: 'responsible_id',
        labelKey: 'fields.responsibleId',
        type: 'lookup',
        lookup: {
          endpoint: '/users',
          valueKey: 'id',
          labelKeys: ['firstName', 'lastName', 'email']
        }
      },
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

 farms: {
  module: 'farms',
  titleKey: 'resources.farms.title',
  descriptionKey: 'resources.farms.description',
  endpoint: '/farms',
  listFields: ['name', 'code', 'company_id', 'region', 'city', 'surface_ha', 'status'],
  fields: [
    {
      key: 'company_id',
      labelKey: 'fields.companyId',
      type: 'lookup',
      required: true,
      lookup: {
        endpoint: '/companies',
        valueKey: 'id',
        labelKeys: ['name', 'code'],
        scopeEntityType: 'COMPANY'
      }
    },
    {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
    {key: 'code', labelKey: 'fields.code', type: 'text'},
    {
      key: 'category',
      labelKey: 'fields.category',
      type: 'select',
      options: [
        {labelKey: 'options.farmCategory.OWNED', value: 'OWNED'},
        {labelKey: 'options.farmCategory.TPG', value: 'TPG'},
        {labelKey: 'options.farmCategory.THIRD_PARTY', value: 'THIRD_PARTY'}
      ]
    },
    {key: 'address', labelKey: 'fields.address', type: 'text'},
{
  key: 'country',
  labelKey: 'fields.country',
  type: 'select',
  options: countryOptions,
  required: true,
  persist: false
},
    {
      key: 'region',
      labelKey: 'fields.region',
      type: 'select',
      dependsOn: {
        fieldKey: 'country',
        optionsByValue: regionOptionsByCountry
      }
    },
    {
      key: 'city',
      labelKey: 'fields.city',
      type: 'select',
      dependsOn: {
        fieldKey: 'region',
        optionsByValue: cityOptionsByRegion
      }
    },
    {key: 'latitude', labelKey: 'fields.latitude', type: 'number'},
    {key: 'longitude', labelKey: 'fields.longitude', type: 'number'},
    {key: 'surface_ha', labelKey: 'fields.surfaceHa', type: 'number'},
    {key: 'rent_monthly', labelKey: 'fields.rentMonthly', type: 'number'},
    {
      key: 'responsible_id',
      labelKey: 'fields.responsibleId',
      type: 'lookup',
      lookup: {
        endpoint: '/users',
        valueKey: 'id',
        labelKeys: ['firstName', 'lastName', 'email']
      }
    },
    {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
  ]
},

  plots: {
    module: 'plots',
    titleKey: 'resources.plots.title',
    descriptionKey: 'resources.plots.description',
    endpoint: '/plots',
    listFields: ['code', 'name', 'surface_ha', 'culture', 'variety', 'status'],
    fields: [
      {key: 'farm_id', labelKey: 'fields.farmId', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text', required: true},
      {key: 'name', labelKey: 'fields.name', type: 'text'},
      {key: 'surface_ha', labelKey: 'fields.surfaceHa', type: 'number', required: true},
      {key: 'culture', labelKey: 'fields.culture', type: 'select', options: cultureOptions},
      {key: 'variety', labelKey: 'fields.variety', type: 'text'},
      {
        key: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: [
          {labelKey: 'options.plotStatus.PRODUCTION', value: 'PRODUCTION'},
          {labelKey: 'options.plotStatus.YOUNG', value: 'YOUNG'},
          {labelKey: 'options.plotStatus.RESTING', value: 'RESTING'},
          {labelKey: 'options.plotStatus.ABANDONED', value: 'ABANDONED'}
        ]
      },
      {key: 'latitude', labelKey: 'fields.latitude', type: 'number'},
      {key: 'longitude', labelKey: 'fields.longitude', type: 'number'}
    ]
  },

  factories: {
    module: 'factories',
    titleKey: 'resources.factories.title',
    descriptionKey: 'resources.factories.description',
    endpoint: '/factories',
    listFields: ['name', 'code', 'city', 'daily_capacity_kg', 'status'],
    fields: [
      {key: 'company_id', labelKey: 'fields.companyId', type: 'text', required: true},
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'address', labelKey: 'fields.address', type: 'text'},
      {key: 'city', labelKey: 'fields.city', type: 'text'},
      {key: 'region', labelKey: 'fields.region', type: 'text'},
      {key: 'latitude', labelKey: 'fields.latitude', type: 'number'},
      {key: 'longitude', labelKey: 'fields.longitude', type: 'number'},
      {key: 'daily_capacity_kg', labelKey: 'fields.dailyCapacityKg', type: 'number'},
      {key: 'responsible_id', labelKey: 'fields.responsibleId', type: 'text'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

  stations: {
    module: 'stations',
    titleKey: 'resources.stations.title',
    descriptionKey: 'resources.stations.description',
    endpoint: '/stations',
    listFields: ['name', 'code', 'daily_capacity_kg', 'location', 'features', 'status'],
    fields: [
      {key: 'company_id', labelKey: 'fields.companyId', type: 'text'},
      {key: 'factory_id', labelKey: 'fields.factoryId', type: 'text'},
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'daily_capacity_kg', labelKey: 'fields.dailyCapacityKg', type: 'number'},
      {key: 'location', labelKey: 'fields.location', type: 'text'},
      {key: 'latitude', labelKey: 'fields.latitude', type: 'number'},
      {key: 'longitude', labelKey: 'fields.longitude', type: 'number'},
      {
        key: 'features',
        labelKey: 'fields.features',
        type: 'multiselect',
        options: stationFeatureOptions
      },
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

  products: {
    module: 'products',
    titleKey: 'resources.products.title',
    descriptionKey: 'resources.products.description',
    endpoint: '/products',
    listFields: ['name', 'code', 'culture', 'default_unit', 'status'],
    fields: [
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'culture', labelKey: 'fields.culture', type: 'select', options: cultureOptions},
      {key: 'description', labelKey: 'fields.description', type: 'text'},
      {key: 'default_unit', labelKey: 'fields.defaultUnit', type: 'text'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

  'product-varieties': {
    module: 'product-varieties',
    titleKey: 'resources.productVarieties.title',
    descriptionKey: 'resources.productVarieties.description',
    endpoint: '/product-varieties',
    listFields: ['name', 'code', 'description', 'status'],
    fields: [
      {key: 'product_id', labelKey: 'fields.productId', type: 'text', required: true},
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'description', labelKey: 'fields.description', type: 'text'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

  vehicles: {
    module: 'vehicles',
    titleKey: 'resources.vehicles.title',
    descriptionKey: 'resources.vehicles.description',
    endpoint: '/vehicles',
    listFields: ['registration_number', 'type', 'brand', 'model', 'capacity_kg', 'status'],
    fields: [
      {key: 'company_id', labelKey: 'fields.companyId', type: 'text'},
      {
        key: 'type',
        labelKey: 'fields.type',
        type: 'select',
        options: [
          {labelKey: 'options.vehicleType.REFRIGERATED', value: 'REFRIGERATED'},
          {labelKey: 'options.vehicleType.UTILITY', value: 'UTILITY'},
          {labelKey: 'options.vehicleType.AGRICULTURAL', value: 'AGRICULTURAL'},
          {labelKey: 'options.vehicleType.COMPANY_CAR', value: 'COMPANY_CAR'},
          {labelKey: 'options.vehicleType.OTHER', value: 'OTHER'}
        ]
      },
      {key: 'brand', labelKey: 'fields.brand', type: 'text'},
      {key: 'model', labelKey: 'fields.model', type: 'text'},
      {key: 'registration_number', labelKey: 'fields.registrationNumber', type: 'text'},
      {key: 'acquisition_mode', labelKey: 'fields.acquisitionMode', type: 'text'},
      {key: 'rent_monthly', labelKey: 'fields.rentMonthly', type: 'number'},
      {key: 'capacity_kg', labelKey: 'fields.capacityKg', type: 'number'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

  personnel: {
    module: 'personnel',
    titleKey: 'resources.personnel.title',
    descriptionKey: 'resources.personnel.description',
    endpoint: '/personnel',
    listFields: ['full_name', 'grade', 'contract_type', 'salary', 'status'],
    fields: [
      {key: 'user_id', labelKey: 'fields.userId', type: 'text'},
      {key: 'company_id', labelKey: 'fields.companyId', type: 'text'},
      {key: 'farm_id', labelKey: 'fields.farmId', type: 'text'},
      {key: 'factory_id', labelKey: 'fields.factoryId', type: 'text'},
      {key: 'station_id', labelKey: 'fields.stationId', type: 'text'},
      {key: 'full_name', labelKey: 'fields.fullName', type: 'text', required: true},
      {key: 'grade', labelKey: 'fields.grade', type: 'text'},
      {key: 'contract_type', labelKey: 'fields.contractType', type: 'text'},
      {key: 'salary', labelKey: 'fields.salary', type: 'number'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  }
};