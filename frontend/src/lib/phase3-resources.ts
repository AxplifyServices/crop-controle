import type {
  ResourceConfig,
  ResourceOption,
  ResourceStatusSection
} from './phase2-resources';

const projectStatusOptions: ResourceOption[] = [
  {labelKey: 'options.projectStatus.PREPARATION', value: 'PREPARATION'},
  {labelKey: 'options.projectStatus.IN_PRODUCTION', value: 'IN_PRODUCTION'},
  {labelKey: 'options.projectStatus.FINISHED', value: 'FINISHED'},
  {labelKey: 'options.projectStatus.SUSPENDED', value: 'SUSPENDED'},
  {labelKey: 'options.projectStatus.CANCELLED', value: 'CANCELLED'}
];

const projectStatusSections: ResourceStatusSection[] = [
  {
    titleKey: 'sections.projectPreparation',
    values: ['PREPARATION'],
    defaultOpen: true
  },
  {
    titleKey: 'sections.projectInProduction',
    values: ['IN_PRODUCTION'],
    defaultOpen: true
  },
  {
    titleKey: 'sections.projectClosed',
    values: ['FINISHED', 'SUSPENDED', 'CANCELLED'],
    defaultOpen: false
  }
];

const plantationOperationTypeOptions: ResourceOption[] = [
  {
    labelKey: 'options.plantationOperationType.INITIAL',
    value: 'INITIAL'
  },
  {
    labelKey: 'options.plantationOperationType.REPLACEMENT',
    value: 'REPLACEMENT'
  },
  {
    labelKey: 'options.plantationOperationType.ADDITIONAL',
    value: 'ADDITIONAL'
  }
];

const plantMovementTypeOptions: ResourceOption[] = [
  {
    labelKey: 'options.plantMovementType.MORTALITY',
    value: 'MORTALITY'
  },
  {
    labelKey: 'options.plantMovementType.UPROOTING',
    value: 'UPROOTING'
  },
  {
    labelKey: 'options.plantMovementType.NON_PRODUCTIVE',
    value: 'NON_PRODUCTIVE'
  },
  {
    labelKey: 'options.plantMovementType.REACTIVATION',
    value: 'REACTIVATION'
  },
  {
    labelKey: 'options.plantMovementType.POSITIVE_ADJUSTMENT',
    value: 'POSITIVE_ADJUSTMENT'
  },
  {
    labelKey: 'options.plantMovementType.NEGATIVE_ADJUSTMENT',
    value: 'NEGATIVE_ADJUSTMENT'
  }
];

const qualityGradeOptions: ResourceOption[] = [
  {
    labelKey: 'options.qualityGrade.PREMIUM',
    value: 'PREMIUM'
  },
  {
    labelKey: 'options.qualityGrade.STANDARD',
    value: 'STANDARD'
  },
  {
    labelKey: 'options.qualityGrade.DOWNGRADED',
    value: 'DOWNGRADED'
  },
  {
    labelKey: 'options.qualityGrade.REFUSED',
    value: 'REFUSED'
  }
];

const chargeTypeOptions: ResourceOption[] = [
  {labelKey: 'options.chargeType.WATER', value: 'WATER'},
  {labelKey: 'options.chargeType.FERTILIZER', value: 'FERTILIZER'},
  {labelKey: 'options.chargeType.SEEDS', value: 'SEEDS'},
  {labelKey: 'options.chargeType.PLANTS', value: 'PLANTS'},
  {labelKey: 'options.chargeType.PHYTOSANITARY', value: 'PHYTOSANITARY'},
  {labelKey: 'options.chargeType.LABOR', value: 'LABOR'},
  {labelKey: 'options.chargeType.ENERGY', value: 'ENERGY'},
  {labelKey: 'options.chargeType.MATERIAL', value: 'MATERIAL'},
  {labelKey: 'options.chargeType.PACKAGING', value: 'PACKAGING'},
  {labelKey: 'options.chargeType.INTERNAL_TRANSPORT', value: 'INTERNAL_TRANSPORT'},
  {labelKey: 'options.chargeType.MAINTENANCE', value: 'MAINTENANCE'},
  {labelKey: 'options.chargeType.RENT', value: 'RENT'},
  {labelKey: 'options.chargeType.LOGISTICS', value: 'LOGISTICS'},
  {labelKey: 'options.chargeType.OTHER', value: 'OTHER'}
];

const currencyOptions: ResourceOption[] = [
  {
    labelKey: 'options.currency.MAD',
    value: 'MAD'
  },
  {
    labelKey: 'options.currency.EUR',
    value: 'EUR'
  },
  {
    labelKey: 'options.currency.USD',
    value: 'USD'
  }
];

export const phase3Resources: Record<string, ResourceConfig> = {
  'agricultural-projects': {
    module: 'agricultural-projects',
    titleKey: 'resources.agriculturalProjects.title',
    descriptionKey: 'resources.agriculturalProjects.description',
    endpoint: '/agricultural-projects',
    listFields: [
      'name',
      'farm_id',
      'plot_id',
      'product_id',
      'season',
      'plant_count',
      'active_plant_count',
      'surface_ha',
      'status'
    ],
    filterFields: ['farm_id', 'plot_id', 'product_id', 'variety_id', 'status'],
    statusSections: projectStatusSections,
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
      {
        key: 'plot_id',
        labelKey: 'fields.plotId',
        type: 'lookup',
        lookup: {
          endpoint: '/plots',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'PLOT'
        },
        lookupFilter: {
          fieldKey: 'farm_id',
          targetKey: 'farm_id'
        }
      },
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
      {
        key: 'variety_id',
        labelKey: 'fields.varietyId',
        type: 'lookup',
        lookup: {
          endpoint: '/product-varieties',
          valueKey: 'id',
          labelKeys: ['name', 'code']
        },
        lookupFilter: {
          fieldKey: 'product_id',
          targetKey: 'product_id'
        }
      },
      {key: 'name', labelKey: 'fields.name', type: 'text', required: true},
      {key: 'season', labelKey: 'fields.season', type: 'text'},
{
  key: 'planned_plant_count',
  labelKey: 'fields.plannedPlantCount',
  type: 'number'
},
{
  key: 'initial_planted_count',
  labelKey: 'fields.initialPlantedCount',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'total_planted_count',
  labelKey: 'fields.totalPlantedCount',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'active_plant_count',
  labelKey: 'fields.activePlantCount',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'total_loss_count',
  labelKey: 'fields.totalLossCount',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'planting_completion_rate',
  labelKey: 'fields.plantingCompletionRate',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'survival_rate',
  labelKey: 'fields.survivalRate',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'planned_density_per_ha',
  labelKey: 'fields.plannedDensityPerHa',
  type: 'number',
  persist: false,
  readOnly: true
},
{
  key: 'actual_density_per_ha',
  labelKey: 'fields.actualDensityPerHa',
  type: 'number',
  persist: false,
  readOnly: true
},
      {key: 'surface_ha', labelKey: 'fields.surfaceHa', type: 'number'},
      {key: 'start_date', labelKey: 'fields.startDate', type: 'date'},
      {key: 'expected_end_date', labelKey: 'fields.expectedEndDate', type: 'date'},
      {key: 'end_date', labelKey: 'fields.endDate', type: 'date'},
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
      {
        key: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: projectStatusOptions
      }
    ]
  },

  plantations: {
    module: 'plantations',
    titleKey: 'resources.plantations.title',
    descriptionKey: 'resources.plantations.description',
    endpoint: '/plantations',
listFields: [
  'name',
  'plot_id',
  'product_id',
  'planned_plant_count',
  'initial_planted_count',
  'active_plant_count',
  'survival_rate',
  'status'
],
filterFields: [
  'project_id',
  'operation_type'
],
fields: [
  {
    key: 'project_id',
    labelKey: 'fields.projectId',
    type: 'lookup',
    required: true,
    lookup: {
      endpoint: '/agricultural-projects',
      valueKey: 'id',
      labelKeys: ['name', 'season']
    }
  },
  {
    key: 'planting_date',
    labelKey: 'fields.plantingDate',
    type: 'date',
    required: true
  },
  {
    key: 'operation_type',
    labelKey: 'fields.plantationOperationType',
    type: 'select',
    required: true,
    defaultValue: 'INITIAL',
    options: plantationOperationTypeOptions
  },
  {
    key: 'plant_quantity',
    labelKey: 'fields.plantedPlantCount',
    type: 'number',
    required: true
  },
  {
    key: 'planted_surface_ha',
    labelKey: 'fields.plantedSurfaceHa',
    type: 'number'
  },
  {
    key: 'density_per_ha',
    labelKey: 'fields.actualDensityPerHa',
    type: 'number',
    persist: false,
    readOnly: true
  },
  {
    key: 'total_cost',
    labelKey: 'fields.totalCost',
    type: 'number'
  },
  {
    key: 'currency',
    labelKey: 'fields.currency',
    type: 'select',
    options: currencyOptions,
    defaultValue: 'MAD'
  },
  {
    key: 'observations',
    labelKey: 'fields.observations',
    type: 'text'
  }
]
  },

  'plant-movements': {
    module: 'plant-movements',
    titleKey: 'resources.plantMovements.title',
    descriptionKey: 'resources.plantMovements.description',
    endpoint: '/plant-movements',

    listFields: [
      'movement_date',
      'project_id',
      'type',
      'plant_count',
      'reason'
    ],

    filterFields: [
      'project_id',
      'type'
    ],

    fields: [
      {
        key: 'project_id',
        labelKey: 'fields.projectId',
        type: 'lookup',
        required: true,
        lookup: {
          endpoint: '/agricultural-projects',
          valueKey: 'id',
          labelKeys: ['name', 'season']
        }
      },
      {
        key: 'movement_date',
        labelKey: 'fields.movementDate',
        type: 'date',
        required: true
      },
      {
        key: 'type',
        labelKey: 'fields.plantMovementType',
        type: 'select',
        required: true,
        options: plantMovementTypeOptions
      },
      {
        key: 'plant_count',
        labelKey: 'fields.affectedPlantCount',
        type: 'number',
        required: true
      },
      {
        key: 'reason',
        labelKey: 'fields.reason',
        type: 'text'
      },
      {
        key: 'observations',
        labelKey: 'fields.observations',
        type: 'text'
      }
    ]
  },

  treatments: {
    module: 'treatments',
    titleKey: 'resources.treatments.title',
    descriptionKey: 'resources.treatments.description',
    endpoint: '/treatments',
    listFields: [
      'treatment_date',
      'plot_id',
      'project_id',
      'product_type',
      'product_name',
      'dose',
      'treated_surface_ha',
      'cost'
    ],
    filterFields: ['project_id', 'product_type'],
    fields: [
      {
        key: 'project_id',
        labelKey: 'fields.projectId',
        type: 'lookup',
        lookup: {
          endpoint: '/agricultural-projects',
          valueKey: 'id',
          labelKeys: ['name', 'season']
        }
      },

      {key: 'treatment_date', labelKey: 'fields.treatmentDate', type: 'date', required: true},
      {key: 'product_type', labelKey: 'fields.productType', type: 'text'},
      {key: 'product_name', labelKey: 'fields.productName', type: 'text'},
      {key: 'dose', labelKey: 'fields.dose', type: 'text'},
      {key: 'treated_surface_ha', labelKey: 'fields.treatedSurfaceHa', type: 'number'},
      {key: 'cost', labelKey: 'fields.cost', type: 'number'},
      {
  key: 'currency',
  labelKey: 'fields.currency',
  type: 'select',
  options: currencyOptions,
  defaultValue: 'MAD'
},
      {key: 'observations', labelKey: 'fields.observations', type: 'text'}
    ]
  },

  harvests: {
    module: 'harvests',
    titleKey: 'resources.harvests.title',
    descriptionKey: 'resources.harvests.description',
    endpoint: '/harvests',
    listFields: [
      'harvest_date',
      'project_id',
      'farm_id',
      'plot_id',
      'product_id',
      'weight_total_kg',
      'quality_grade'
    ],
filterFields: ['project_id', 'quality_grade'],
fields: [
  {
    key: 'project_id',
    labelKey: 'fields.projectId',
    type: 'lookup',
    required: true,
    lookup: {
      endpoint: '/agricultural-projects',
      valueKey: 'id',
      labelKeys: ['name', 'season']
    }
  },
  {
    key: 'harvest_date',
    labelKey: 'fields.harvestDate',
    type: 'date',
    required: true
  },
  {
    key: 'weight_total_kg',
    labelKey: 'fields.weightTotalKg',
    type: 'number',
    required: true
  },
  {
    key: 'team',
    labelKey: 'fields.team',
    type: 'text'
  },
  {
    key: 'quality_grade',
    labelKey: 'fields.qualityGrade',
    type: 'select',
    options: qualityGradeOptions
  },
  {
    key: 'observations',
    labelKey: 'fields.observations',
    type: 'text'
  }
]
  },

  productions: {
    module: 'productions',
    titleKey: 'resources.productions.title',
    descriptionKey: 'resources.productions.description',
    endpoint: '/productions',
    listFields: [
      'production_date',
      'project_id',
      'farm_id',
      'plot_id',
      'product_id',
      'quantity_kg',
      'active_plant_count',
      'production_per_plant',
      'quality_grade'
    ],
    filterFields: [
      'project_id',
      'farm_id',
      'plot_id',
      'product_id',
      'variety_id',
      'quality_grade'
    ],
    fields: [
      {
        key: 'harvest_id',
        labelKey: 'fields.harvestId',
        type: 'lookup',
        lookup: {
          endpoint: '/harvests',
          valueKey: 'id',
          labelKeys: ['harvest_date', 'weight_total_kg']
        }
      },
      {
        key: 'project_id',
        labelKey: 'fields.projectId',
        type: 'lookup',
        required: true,
        lookup: {
          endpoint: '/agricultural-projects',
          valueKey: 'id',
          labelKeys: ['name', 'season']
        }
      },
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
      {
        key: 'plot_id',
        labelKey: 'fields.plotId',
        type: 'lookup',
        lookup: {
          endpoint: '/plots',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'PLOT'
        },
        lookupFilter: {
          fieldKey: 'farm_id',
          targetKey: 'farm_id'
        }
      },
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
      {
        key: 'variety_id',
        labelKey: 'fields.varietyId',
        type: 'lookup',
        lookup: {
          endpoint: '/product-varieties',
          valueKey: 'id',
          labelKeys: ['name', 'code']
        },
        lookupFilter: {
          fieldKey: 'product_id',
          targetKey: 'product_id'
        }
      },
      {key: 'production_date', labelKey: 'fields.productionDate', type: 'date', required: true},
      {key: 'quantity_kg', labelKey: 'fields.quantityKg', type: 'number', required: true},
      {
        key: 'quality_grade',
        labelKey: 'fields.qualityGrade',
        type: 'select',
        options: qualityGradeOptions
      },
      {key: 'active_plant_count', labelKey: 'fields.activePlantCount', type: 'number'},
      {key: 'production_per_plant', labelKey: 'fields.productionPerPlant', type: 'number'},
      {key: 'source', labelKey: 'fields.source', type: 'text'},
      {key: 'observations', labelKey: 'fields.observations', type: 'text'}
    ]
  },

  charges: {
    module: 'charges',
    titleKey: 'resources.charges.title',
    descriptionKey: 'resources.charges.description',
    endpoint: '/charges',
    listFields: [
      'charge_date',
      'type',
      'label',
      'farm_id',
      'project_id',
      'plot_id',
      'quantity',
      'unit_cost',
      'total_cost'
    ],
    filterFields: ['farm_id', 'project_id', 'plot_id', 'type'],
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
      {
        key: 'project_id',
        labelKey: 'fields.projectId',
        type: 'lookup',
        lookup: {
          endpoint: '/agricultural-projects',
          valueKey: 'id',
          labelKeys: ['name', 'season']
        },
        lookupFilter: {
          fieldKey: 'farm_id',
          targetKey: 'farm_id'
        }
      },
      {
        key: 'plot_id',
        labelKey: 'fields.plotId',
        type: 'lookup',
        lookup: {
          endpoint: '/plots',
          valueKey: 'id',
          labelKeys: ['name', 'code'],
          scopeEntityType: 'PLOT'
        },
        lookupFilter: {
          fieldKey: 'farm_id',
          targetKey: 'farm_id'
        }
      },
      {
        key: 'type',
        labelKey: 'fields.type',
        type: 'select',
        required: true,
        options: chargeTypeOptions
      },
      {key: 'label', labelKey: 'fields.label', type: 'text', required: true},
      {key: 'quantity', labelKey: 'fields.quantity', type: 'number'},
      {key: 'unit', labelKey: 'fields.unit', type: 'text'},
      {key: 'unit_cost', labelKey: 'fields.unitCost', type: 'number'},
      {key: 'total_cost', labelKey: 'fields.totalCost', type: 'number'},
    {
  key: 'currency',
  labelKey: 'fields.currency',
  type: 'select',
  options: currencyOptions,
  defaultValue: 'MAD'
},
      {key: 'supplier', labelKey: 'fields.supplier', type: 'text'},
      {key: 'charge_date', labelKey: 'fields.chargeDate', type: 'date', required: true},
      {key: 'description', labelKey: 'fields.description', type: 'text'}
    ]
  }
};