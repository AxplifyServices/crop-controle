export type FieldType = 'text' | 'number' | 'select';

export type ResourceField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: {label: string; value: string}[];
};

export type ResourceConfig = {
  module: string;
  title: string;
  description: string;
  endpoint: string;
  listFields: string[];
  fields: ResourceField[];
};

const statusOptions = [
  {label: 'Actif', value: 'ACTIVE'},
  {label: 'Inactif', value: 'INACTIVE'},
  {label: 'Archivé', value: 'ARCHIVED'}
];

export const phase2Resources: Record<string, ResourceConfig> = {
  groups: {
    module: 'groups',
    title: 'Groupes',
    description: 'Structure principale du groupe agricole.',
    endpoint: '/groups',
    listFields: ['name', 'description'],
    fields: [
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'description', label: 'Description', type: 'text'}
    ]
  },

  companies: {
    module: 'companies',
    title: 'Entreprises',
    description: 'Entreprises, filiales et hiérarchie juridique du groupe.',
    endpoint: '/companies',
    listFields: ['name', 'code', 'city', 'region', 'status'],
    fields: [
      {key: 'group_id', label: 'ID groupe', type: 'text', required: true},
      {key: 'parent_id', label: 'ID entreprise mère', type: 'text'},
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'legal_name', label: 'Raison sociale', type: 'text'},
      {key: 'code', label: 'Code', type: 'text'},
      {key: 'ice', label: 'ICE', type: 'text'},
      {key: 'tax_id', label: 'Identifiant fiscal', type: 'text'},
      {key: 'rc', label: 'RC', type: 'text'},
      {key: 'cnss', label: 'CNSS', type: 'text'},
      {key: 'patente', label: 'Patente', type: 'text'},
      {key: 'address', label: 'Adresse', type: 'text'},
      {key: 'city', label: 'Ville', type: 'text'},
      {key: 'region', label: 'Région', type: 'text'},
      {key: 'country', label: 'Pays', type: 'text'},
      {key: 'latitude', label: 'Latitude', type: 'number'},
      {key: 'longitude', label: 'Longitude', type: 'number'},
      {key: 'responsible_id', label: 'ID responsable', type: 'text'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  farms: {
    module: 'farms',
    title: 'Fermes',
    description: 'Fermes propres, TPG et tiers partenaires.',
    endpoint: '/farms',
    listFields: ['name', 'code', 'category', 'city', 'surface_ha', 'status'],
    fields: [
      {key: 'company_id', label: 'ID entreprise', type: 'text', required: true},
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'code', label: 'Code', type: 'text'},
      {
        key: 'category',
        label: 'Catégorie',
        type: 'select',
        options: [
          {label: 'Ferme propre', value: 'OWNED'},
          {label: 'TPG', value: 'TPG'},
          {label: 'Tiers', value: 'THIRD_PARTY'}
        ]
      },
      {key: 'address', label: 'Adresse', type: 'text'},
      {key: 'city', label: 'Ville', type: 'text'},
      {key: 'region', label: 'Région', type: 'text'},
      {key: 'latitude', label: 'Latitude', type: 'number'},
      {key: 'longitude', label: 'Longitude', type: 'number'},
      {key: 'surface_ha', label: 'Surface HA', type: 'number'},
      {key: 'rent_monthly', label: 'Loyer mensuel', type: 'number'},
      {key: 'responsible_id', label: 'ID responsable', type: 'text'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  plots: {
    module: 'plots',
    title: 'Parcelles',
    description: 'Parcelles cultivées rattachées aux fermes.',
    endpoint: '/plots',
    listFields: ['code', 'name', 'surface_ha', 'culture', 'variety', 'status'],
    fields: [
      {key: 'farm_id', label: 'ID ferme', type: 'text', required: true},
      {key: 'code', label: 'Code', type: 'text', required: true},
      {key: 'name', label: 'Nom', type: 'text'},
      {key: 'surface_ha', label: 'Surface HA', type: 'number', required: true},
      {
        key: 'culture',
        label: 'Culture',
        type: 'select',
        options: [
          {label: 'Fraise', value: 'STRAWBERRY'},
          {label: 'Myrtille', value: 'BLUEBERRY'},
          {label: 'Framboise', value: 'RASPBERRY'},
          {label: 'Mûre', value: 'BLACKBERRY'},
          {label: 'Mixte', value: 'MIXED'},
          {label: 'Autre', value: 'OTHER'}
        ]
      },
      {key: 'variety', label: 'Variété', type: 'text'},
      {
        key: 'status',
        label: 'Statut',
        type: 'select',
        options: [
          {label: 'Production', value: 'PRODUCTION'},
          {label: 'Jeune', value: 'YOUNG'},
          {label: 'Repos', value: 'RESTING'},
          {label: 'En friche', value: 'ABANDONED'}
        ]
      },
      {key: 'latitude', label: 'Latitude', type: 'number'},
      {key: 'longitude', label: 'Longitude', type: 'number'}
    ]
  },

  factories: {
    module: 'factories',
    title: 'Usines',
    description: 'Usines de réception, traitement et conditionnement.',
    endpoint: '/factories',
    listFields: ['name', 'code', 'city', 'daily_capacity_kg', 'status'],
    fields: [
      {key: 'company_id', label: 'ID entreprise', type: 'text', required: true},
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'code', label: 'Code', type: 'text'},
      {key: 'address', label: 'Adresse', type: 'text'},
      {key: 'city', label: 'Ville', type: 'text'},
      {key: 'region', label: 'Région', type: 'text'},
      {key: 'latitude', label: 'Latitude', type: 'number'},
      {key: 'longitude', label: 'Longitude', type: 'number'},
      {key: 'daily_capacity_kg', label: 'Capacité journalière KG', type: 'number'},
      {key: 'responsible_id', label: 'ID responsable', type: 'text'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  stations: {
    module: 'stations',
    title: 'Stations UC',
    description: 'Stations et unités de conditionnement.',
    endpoint: '/stations',
    listFields: ['name', 'code', 'daily_capacity_kg', 'location', 'status'],
    fields: [
      {key: 'company_id', label: 'ID entreprise', type: 'text'},
      {key: 'factory_id', label: 'ID usine', type: 'text'},
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'code', label: 'Code', type: 'text'},
      {key: 'daily_capacity_kg', label: 'Capacité journalière KG', type: 'number'},
      {key: 'location', label: 'Localisation', type: 'text'},
      {key: 'latitude', label: 'Latitude', type: 'number'},
      {key: 'longitude', label: 'Longitude', type: 'number'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  products: {
    module: 'products',
    title: 'Produits',
    description: 'Produits agricoles suivis dans la plateforme.',
    endpoint: '/products',
    listFields: ['name', 'code', 'culture', 'default_unit', 'status'],
    fields: [
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'code', label: 'Code', type: 'text'},
      {
        key: 'culture',
        label: 'Culture',
        type: 'select',
        options: [
          {label: 'Fraise', value: 'STRAWBERRY'},
          {label: 'Myrtille', value: 'BLUEBERRY'},
          {label: 'Framboise', value: 'RASPBERRY'},
          {label: 'Mûre', value: 'BLACKBERRY'},
          {label: 'Mixte', value: 'MIXED'},
          {label: 'Autre', value: 'OTHER'}
        ]
      },
      {key: 'description', label: 'Description', type: 'text'},
      {key: 'default_unit', label: 'Unité par défaut', type: 'text'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  'product-varieties': {
    module: 'product-varieties',
    title: 'Variétés',
    description: 'Variétés rattachées aux produits agricoles.',
    endpoint: '/product-varieties',
    listFields: ['name', 'code', 'description', 'status'],
    fields: [
      {key: 'product_id', label: 'ID produit', type: 'text', required: true},
      {key: 'name', label: 'Nom', type: 'text', required: true},
      {key: 'code', label: 'Code', type: 'text'},
      {key: 'description', label: 'Description', type: 'text'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  vehicles: {
    module: 'vehicles',
    title: 'Véhicules',
    description: 'Véhicules agricoles, logistiques ou frigorifiques.',
    endpoint: '/vehicles',
    listFields: ['registration_number', 'type', 'brand', 'model', 'capacity_kg', 'status'],
    fields: [
      {key: 'company_id', label: 'ID entreprise', type: 'text'},
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
          {label: 'Frigorifique', value: 'REFRIGERATED'},
          {label: 'Utilitaire', value: 'UTILITY'},
          {label: 'Agricole', value: 'AGRICULTURAL'},
          {label: 'Voiture fonction', value: 'COMPANY_CAR'},
          {label: 'Autre', value: 'OTHER'}
        ]
      },
      {key: 'brand', label: 'Marque', type: 'text'},
      {key: 'model', label: 'Modèle', type: 'text'},
      {key: 'registration_number', label: 'Immatriculation', type: 'text'},
      {key: 'acquisition_mode', label: 'Mode acquisition', type: 'text'},
      {key: 'rent_monthly', label: 'Loyer mensuel', type: 'number'},
      {key: 'capacity_kg', label: 'Capacité KG', type: 'number'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  },

  personnel: {
    module: 'personnel',
    title: 'Personnel',
    description: 'Personnel opérationnel rattaché aux entités.',
    endpoint: '/personnel',
    listFields: ['full_name', 'grade', 'contract_type', 'salary', 'status'],
    fields: [
      {key: 'user_id', label: 'ID utilisateur', type: 'text'},
      {key: 'company_id', label: 'ID entreprise', type: 'text'},
      {key: 'farm_id', label: 'ID ferme', type: 'text'},
      {key: 'factory_id', label: 'ID usine', type: 'text'},
      {key: 'station_id', label: 'ID station', type: 'text'},
      {key: 'full_name', label: 'Nom complet', type: 'text', required: true},
      {key: 'grade', label: 'Grade', type: 'text'},
      {key: 'contract_type', label: 'Type contrat', type: 'text'},
      {key: 'salary', label: 'Salaire', type: 'number'},
      {key: 'status', label: 'Statut', type: 'select', options: statusOptions}
    ]
  }
};