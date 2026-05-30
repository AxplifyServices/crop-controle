import type {ResourceOption} from '@/lib/phase2-resources';

export const countryOptions: ResourceOption[] = [
  {labelKey: 'options.country.MOROCCO', value: 'Maroc'},
  {labelKey: 'options.country.SPAIN', value: 'Espagne'}
];

export const regionOptionsByCountry: Record<string, ResourceOption[]> = {
  Maroc: [
    {labelKey: 'options.region.MA_TANGER_TETOUAN_AL_HOCEIMA', value: 'Tanger-Tétouan-Al Hoceïma'},
    {labelKey: 'options.region.MA_ORIENTAL', value: "L'Oriental"},
    {labelKey: 'options.region.MA_FES_MEKNES', value: 'Fès-Meknès'},
    {labelKey: 'options.region.MA_RABAT_SALE_KENITRA', value: 'Rabat-Salé-Kénitra'},
    {labelKey: 'options.region.MA_BENI_MELLAL_KHENIFRA', value: 'Béni Mellal-Khénifra'},
    {labelKey: 'options.region.MA_CASABLANCA_SETTAT', value: 'Casablanca-Settat'},
    {labelKey: 'options.region.MA_MARRAKECH_SAFI', value: 'Marrakech-Safi'},
    {labelKey: 'options.region.MA_DRAA_TAFILALET', value: 'Drâa-Tafilalet'},
    {labelKey: 'options.region.MA_SOUSS_MASSA', value: 'Souss-Massa'},
    {labelKey: 'options.region.MA_GUELMIM_OUED_NOUN', value: 'Guelmim-Oued Noun'},
    {labelKey: 'options.region.MA_LAAYOUNE_SAKIA_EL_HAMRA', value: 'Laâyoune-Sakia El Hamra'},
    {labelKey: 'options.region.MA_DAKHLA_OUED_ED_DAHAB', value: 'Dakhla-Oued Ed-Dahab'}
  ],
  Espagne: [
    {labelKey: 'options.region.ES_ANDALUCIA', value: 'Andalousie'},
    {labelKey: 'options.region.ES_ARAGON', value: 'Aragon'},
    {labelKey: 'options.region.ES_CATALUNYA', value: 'Catalogne'},
    {labelKey: 'options.region.ES_COMUNITAT_VALENCIANA', value: 'Communauté valencienne'},
    {labelKey: 'options.region.ES_MADRID', value: 'Madrid'},
    {labelKey: 'options.region.ES_MURCIA', value: 'Murcie'},
    {labelKey: 'options.region.ES_CASTILLA_LA_MANCHA', value: 'Castille-La Manche'},
    {labelKey: 'options.region.ES_CASTILLA_Y_LEON', value: 'Castille-et-León'},
    {labelKey: 'options.region.ES_EXTREMADURA', value: 'Estrémadure'}
  ]
};

export const cityOptionsByRegion: Record<string, ResourceOption[]> = {
  'Tanger-Tétouan-Al Hoceïma': [
    {labelKey: 'options.city.TANGER', value: 'Tanger'},
    {labelKey: 'options.city.TETOUAN', value: 'Tétouan'},
    {labelKey: 'options.city.LARACHE', value: 'Larache'},
    {labelKey: 'options.city.KSAR_EL_KEBIR', value: 'Ksar El Kébir'}
  ],
  "L'Oriental": [
    {labelKey: 'options.city.OUJDA', value: 'Oujda'},
    {labelKey: 'options.city.BERKANE', value: 'Berkane'},
    {labelKey: 'options.city.NADOR', value: 'Nador'}
  ],
  'Fès-Meknès': [
    {labelKey: 'options.city.FES', value: 'Fès'},
    {labelKey: 'options.city.MEKNES', value: 'Meknès'},
    {labelKey: 'options.city.IFRANE', value: 'Ifrane'},
    {labelKey: 'options.city.SEFROU', value: 'Séfrou'}
  ],
  'Rabat-Salé-Kénitra': [
    {labelKey: 'options.city.RABAT', value: 'Rabat'},
    {labelKey: 'options.city.SALE', value: 'Salé'},
    {labelKey: 'options.city.KENITRA', value: 'Kénitra'},
    {labelKey: 'options.city.SIDI_KACEM', value: 'Sidi Kacem'}
  ],
  'Béni Mellal-Khénifra': [
    {labelKey: 'options.city.BENI_MELLAL', value: 'Béni Mellal'},
    {labelKey: 'options.city.KHENIFRA', value: 'Khénifra'},
    {labelKey: 'options.city.FQUIH_BEN_SALAH', value: 'Fquih Ben Salah'}
  ],
  'Casablanca-Settat': [
    {labelKey: 'options.city.CASABLANCA', value: 'Casablanca'},
    {labelKey: 'options.city.SETTAT', value: 'Settat'},
    {labelKey: 'options.city.BERRECHID', value: 'Berrechid'},
    {labelKey: 'options.city.EL_JADIDA', value: 'El Jadida'}
  ],
  'Marrakech-Safi': [
    {labelKey: 'options.city.MARRAKECH', value: 'Marrakech'},
    {labelKey: 'options.city.SAFI', value: 'Safi'},
    {labelKey: 'options.city.ESSAOUIRA', value: 'Essaouira'}
  ],
  'Drâa-Tafilalet': [
    {labelKey: 'options.city.ERRACHIDIA', value: 'Errachidia'},
    {labelKey: 'options.city.OUARZAZATE', value: 'Ouarzazate'},
    {labelKey: 'options.city.ZAGORA', value: 'Zagora'}
  ],
  'Souss-Massa': [
    {labelKey: 'options.city.AGADIR', value: 'Agadir'},
    {labelKey: 'options.city.TAROUDANT', value: 'Taroudant'},
    {labelKey: 'options.city.TIZNIT', value: 'Tiznit'},
    {labelKey: 'options.city.CHTOUKA_AIT_BAHA', value: 'Chtouka-Aït Baha'}
  ],
  'Guelmim-Oued Noun': [{labelKey: 'options.city.GUELMIM', value: 'Guelmim'}],
  'Laâyoune-Sakia El Hamra': [{labelKey: 'options.city.LAAYOUNE', value: 'Laâyoune'}],
  'Dakhla-Oued Ed-Dahab': [{labelKey: 'options.city.DAKHLA', value: 'Dakhla'}],

  Andalousie: [
    {labelKey: 'options.city.HUELVA', value: 'Huelva'},
    {labelKey: 'options.city.SEVILLE', value: 'Séville'},
    {labelKey: 'options.city.MALAGA', value: 'Málaga'},
    {labelKey: 'options.city.ALMERIA', value: 'Almería'}
  ],
  Aragon: [{labelKey: 'options.city.ZARAGOZA', value: 'Saragosse'}],
  Catalogne: [
    {labelKey: 'options.city.BARCELONA', value: 'Barcelone'},
    {labelKey: 'options.city.LLEIDA', value: 'Lleida'},
    {labelKey: 'options.city.TARRAGONA', value: 'Tarragone'}
  ],
  'Communauté valencienne': [
    {labelKey: 'options.city.VALENCIA', value: 'Valence'},
    {labelKey: 'options.city.ALICANTE', value: 'Alicante'},
    {labelKey: 'options.city.CASTELLON', value: 'Castellón'}
  ],
  Madrid: [{labelKey: 'options.city.MADRID', value: 'Madrid'}],
  Murcie: [{labelKey: 'options.city.MURCIA', value: 'Murcie'}],
  'Castille-La Manche': [{labelKey: 'options.city.TOLEDO', value: 'Tolède'}],
  'Castille-et-León': [{labelKey: 'options.city.VALLADOLID', value: 'Valladolid'}],
  Estrémadure: [{labelKey: 'options.city.BADAJOZ', value: 'Badajoz'}]
};