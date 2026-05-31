
export type FieldType = 'text' | 'number' | 'select' | 'lookup' | 'multiselect';

export type ResourceOption = {
  labelKey: string;
  value: string;
  meta?: Record<string, any>;
};

export type ResourceField = {
  key: string;
  labelKey: string;
  type: FieldType;
  geographyLevel?: 'country' | 'region' | 'city';
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
  lookupFilter?: {
    fieldKey: string;
    targetKey: string;
  };
  dependsOn?: {
    fieldKey: string;
    optionsByValue: Record<string, ResourceOption[]>;
  };
  visibleWhen?: {
    fieldKey: string;
    values: string[];
  };
  labelKeyByValue?: {
    fieldKey: string;
    labelsByValue: Record<string, string>;
  };
};

export type ResourceStatusSection = {
  titleKey: string;
  values: string[];
  defaultOpen?: boolean;
};

export type ResourceConfig = {
  module: string;
  titleKey: string;
  descriptionKey: string;
  endpoint: string;
  listFields: string[];
  fields: ResourceField[];
  statusSections?: ResourceStatusSection[];
  filterFields?: string[];
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

const contractTypeOptions = [
  {labelKey: 'options.contractType.PERMANENT', value: 'PERMANENT'},
  {labelKey: 'options.contractType.FIXED_TERM', value: 'FIXED_TERM'},
  {labelKey: 'options.contractType.SEASONAL', value: 'SEASONAL'},
  {labelKey: 'options.contractType.TEMPORARY', value: 'TEMPORARY'},
  {labelKey: 'options.contractType.INTERNSHIP', value: 'INTERNSHIP'},
  {labelKey: 'options.contractType.SERVICE_PROVIDER', value: 'SERVICE_PROVIDER'},
  {labelKey: 'options.contractType.OTHER', value: 'OTHER'}
];

const defaultUnitOptions = [
  {labelKey: 'options.defaultUnit.KG', value: 'KG'},
  {labelKey: 'options.defaultUnit.TON', value: 'TON'},
  {labelKey: 'options.defaultUnit.G', value: 'G'},
  {labelKey: 'options.defaultUnit.UNIT', value: 'UNIT'},
  {labelKey: 'options.defaultUnit.BOX', value: 'BOX'},
  {labelKey: 'options.defaultUnit.PALLET', value: 'PALLET'},
  {labelKey: 'options.defaultUnit.LITER', value: 'LITER'}
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
    filterFields: ['group_id', 'country_id', 'region_id', 'city_id', 'status'],
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
        key: 'country_id',
        labelKey: 'fields.country',
        type: 'select',
        geographyLevel: 'country',
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
        key: 'region_id',
        labelKey: 'fields.region',
        type: 'select',
        geographyLevel: 'region'
      },
      {
        key: 'city_id',
        labelKey: 'fields.city',
        type: 'select',
        geographyLevel: 'city'
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
  filterFields: ['company_id', 'country_id', 'region_id', 'city_id', 'category', 'status'],
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
      key: 'country_id',
      labelKey: 'fields.country',
      type: 'select',
      geographyLevel: 'country',
      required: true
    },
    {
      key: 'region_id',
      labelKey: 'fields.region',
      type: 'select',
      geographyLevel: 'region'
    },
    {
      key: 'city_id',
      labelKey: 'fields.city',
      type: 'select',
      geographyLevel: 'city'
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
    listFields: ['code', 'name', 'farm_id', 'culture_id', 'surface_ha', 'status'],
    filterFields: ['farm_id', 'culture_id', 'status'],
    statusSections: [
      {
        titleKey: 'sections.plotProduction',
        values: ['PRODUCTION'],
        defaultOpen: true
      },
      {
        titleKey: 'sections.plotYoung',
        values: ['JEUNE'],
        defaultOpen: false
      },
      {
        titleKey: 'sections.plotResting',
        values: ['REPOS'],
        defaultOpen: false
      },
      {
        titleKey: 'sections.plotFallow',
        values: ['EN_FRICHE'],
        defaultOpen: false
      },
      {
        titleKey: 'sections.plotArchived',
        values: ['ARCHIVED'],
        defaultOpen: false
      }
    ],
    fields: [
      {
        key: 'farm_id',
        labelKey: 'fields.farmId',
        type: 'lookup',
        required: true,
        lookup: {
          endpoint: '/farms',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'FARM'
        }
      },
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'name', labelKey: 'fields.name', type: 'text'},
      {
        key: 'culture_id',
        labelKey: 'fields.cultureId',
        type: 'lookup',
        lookup: {
          endpoint: '/cultures',
          valueKey: 'id',
          labelKeys: ['name', 'code']
        }
      },
    
      {key: 'surface_ha', labelKey: 'fields.surfaceHa', type: 'number'},
      {
        key: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: [
          {labelKey: 'options.plotStatus.PRODUCTION', value: 'PRODUCTION'},
          {labelKey: 'options.plotStatus.JEUNE', value: 'JEUNE'},
          {labelKey: 'options.plotStatus.REPOS', value: 'REPOS'},
          {labelKey: 'options.plotStatus.EN_FRICHE', value: 'EN_FRICHE'},
          {labelKey: 'options.plotStatus.ARCHIVED', value: 'ARCHIVED'}
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
    listFields: ['name', 'code', 'company_id', 'region', 'city', 'daily_capacity_kg', 'status'],
    filterFields: ['company_id', 'country_id', 'region_id', 'city_id', 'status'], 
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
      {key: 'address', labelKey: 'fields.address', type: 'text'},
{
  key: 'country_id',
  labelKey: 'fields.country',
  type: 'select',
  geographyLevel: 'country',
  required: true
},
{
  key: 'region_id',
  labelKey: 'fields.region',
  type: 'select',
  geographyLevel: 'region'
},
{
  key: 'city_id',
  labelKey: 'fields.city',
  type: 'select',
  geographyLevel: 'city'
},
      {key: 'latitude', labelKey: 'fields.latitude', type: 'number'},
      {key: 'longitude', labelKey: 'fields.longitude', type: 'number'},
      {key: 'daily_capacity_kg', labelKey: 'fields.dailyCapacityKg', type: 'number'},
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

  stations: {
    module: 'stations',
    titleKey: 'resources.stations.title',
    descriptionKey: 'resources.stations.description',
    endpoint: '/stations',
    listFields: ['name', 'code', 'company_id', 'factory_id', 'daily_capacity_kg', 'features', 'status'],
    filterFields: ['company_id', 'factory_id', 'features', 'status'],    
    fields: [
      {
        key: 'company_id',
        labelKey: 'fields.companyId',
        type: 'lookup',
        lookup: {
          endpoint: '/companies',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'COMPANY'
        }
      },
      {
        key: 'factory_id',
        labelKey: 'fields.factoryId',
        type: 'lookup',
        lookup: {
          endpoint: '/factories',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'FACTORY'
        },
        lookupFilter: {
          fieldKey: 'company_id',
          targetKey: 'company_id'
        }
      },
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'daily_capacity_kg', labelKey: 'fields.dailyCapacityKg', type: 'number'},
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
  cultures: {
    module: 'cultures',
    titleKey: 'resources.cultures.title',
    descriptionKey: 'resources.cultures.description',
    endpoint: '/cultures',
    listFields: ['name', 'code', 'description', 'status'],
       filterFields: ['status'],
    fields: [
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'description', labelKey: 'fields.description', type: 'text'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },
  products: {
    module: 'products',
    titleKey: 'resources.products.title',
    descriptionKey: 'resources.products.description',
    endpoint: '/products',
    listFields: ['culture_id', 'name', 'code', 'default_unit', 'status'],
    filterFields: ['culture_id', 'default_unit', 'status'],   
    fields: [
      {
        key: 'culture_id',
        labelKey: 'fields.cultureId',
        type: 'lookup',
        required: true,
        lookup: {
          endpoint: '/cultures',
          valueKey: 'id',
          labelKeys: ['name', 'code']
        }
      },
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'code', labelKey: 'fields.code', type: 'text'},
      {key: 'description', labelKey: 'fields.description', type: 'text'},
      {
        key: 'default_unit',
        labelKey: 'fields.defaultUnit',
        type: 'select',
        options: defaultUnitOptions
      },
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  },

  'product-varieties': {
    module: 'product-varieties',
    titleKey: 'resources.productVarieties.title',
    descriptionKey: 'resources.productVarieties.description',
    endpoint: '/product-varieties',
    listFields: ['product_id', 'name', 'code', 'description', 'status'],
    filterFields: ['product_id', 'status'],   
    fields: [
      {
        key: 'product_id',
        labelKey: 'fields.productId',
        type: 'lookup',
        required: true,
        lookup: {
          endpoint: '/products',
          valueKey: 'id',
          labelKeys: ['name', 'code']
        }
      },
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
    filterFields: ['company_id', 'type', 'acquisition_mode', 'status'],    
    listFields: [
      'registration_number',
      'company_id',
      'type',
      'brand',
      'model',
      'acquisition_mode',
      'capacity_kg',
      'status'
    ],
    fields: [
      {
        key: 'company_id',
        labelKey: 'fields.companyId',
        type: 'lookup',
        lookup: {
          endpoint: '/companies',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'COMPANY'
        }
      },
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
      {
        key: 'acquisition_mode',
        labelKey: 'fields.acquisitionMode',
        type: 'select',
        options: [
          {labelKey: 'options.acquisitionMode.OWNED', value: 'OWNED'},
          {labelKey: 'options.acquisitionMode.LEASED', value: 'LEASED'},
          {labelKey: 'options.acquisitionMode.RENTED', value: 'RENTED'},
          {labelKey: 'options.acquisitionMode.CREDIT', value: 'CREDIT'},
          {labelKey: 'options.acquisitionMode.SUBCONTRACTED', value: 'SUBCONTRACTED'},
          {labelKey: 'options.acquisitionMode.OTHER', value: 'OTHER'}
        ]
      },
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
    filterFields: ['user_id', 'company_id', 'farm_id', 'factory_id', 'station_id', 'contract_type', 'status'],    
    listFields: [
      'full_name',
      'user_id',
      'company_id',
      'farm_id',
      'factory_id',
      'station_id',
      'grade',
      'contract_type',
      'salary',
      'status'
    ],
    fields: [
      {
        key: 'user_id',
        labelKey: 'fields.userId',
        type: 'lookup',
        lookup: {
          endpoint: '/users',
          valueKey: 'id',
          labelKeys: ['firstName', 'lastName', 'email']
        }
      },
      {
        key: 'company_id',
        labelKey: 'fields.companyId',
        type: 'lookup',
        lookup: {
          endpoint: '/companies',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'COMPANY'
        }
      },
      {
        key: 'farm_id',
        labelKey: 'fields.farmId',
        type: 'lookup',
        lookup: {
          endpoint: '/farms',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'FARM'
        },
        lookupFilter: {
          fieldKey: 'company_id',
          targetKey: 'company_id'
        }
      },
      {
        key: 'factory_id',
        labelKey: 'fields.factoryId',
        type: 'lookup',
        lookup: {
          endpoint: '/factories',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'FACTORY'
        },
        lookupFilter: {
          fieldKey: 'company_id',
          targetKey: 'company_id'
        }
      },
{
  key: 'station_id',
  labelKey: 'fields.stationId',
  type: 'lookup',
  lookup: {
    endpoint: '/stations',
    valueKey: 'id',
    labelKeys: ['name', 'code'],
    scopeEntityType: 'STATION'
  },
  lookupFilter: {
    fieldKey: 'factory_id',
    targetKey: 'factory_id'
  }
},
      {key: 'full_name', labelKey: 'fields.fullName', type: 'text', required: true},
      {key: 'grade', labelKey: 'fields.grade', type: 'text'},
      {
        key: 'contract_type',
        labelKey: 'fields.contractType',
        type: 'select',
        options: contractTypeOptions
      },
      {key: 'salary', labelKey: 'fields.salary', type: 'number'},
      {key: 'status', labelKey: 'fields.status', type: 'select', options: statusOptions}
    ]
  }
};