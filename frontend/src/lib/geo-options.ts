import {apiFetch} from '@/lib/api';
import type {ResourceOption} from '@/lib/phase2-resources';

export type GeographyCountry = {
  country_id: string;
  country_code: string;
  country_name: string;
};

export type GeographyRegion = {
  country_id: string;
  country_code: string;
  country_name: string;
  region_id: string;
  region_code: string;
  region_name: string;
};

export type GeographyCity = {
  country_id: string;
  country_code: string;
  country_name: string;
  region_id: string;
  region_code: string;
  region_name: string;
  city_id: string;
  city_name: string;
};

export type GeographyOptions = {
  countries: ResourceOption[];
  regionsByCountryId: Record<string, ResourceOption[]>;
  citiesByRegionId: Record<string, ResourceOption[]>;
};

export const emptyGeographyOptions: GeographyOptions = {
  countries: [],
  regionsByCountryId: {},
  citiesByRegionId: {}
};

export async function loadGeographyOptions(): Promise<GeographyOptions> {
  const countries = await apiFetch<GeographyCountry[]>('/geography/countries');

  const countryOptions: ResourceOption[] = countries.map((country) => ({
    value: country.country_id,
    labelKey: country.country_name,
    meta: country
  }));

  const regionsByCountryId: Record<string, ResourceOption[]> = {};
  const citiesByRegionId: Record<string, ResourceOption[]> = {};

  await Promise.all(
    countries.map(async (country) => {
      const regions = await apiFetch<GeographyRegion[]>(
        `/geography/regions?countryId=${encodeURIComponent(country.country_id)}`
      );

      regionsByCountryId[country.country_id] = regions.map((region) => ({
        value: region.region_id,
        labelKey: region.region_name,
        meta: region
      }));

      await Promise.all(
        regions.map(async (region) => {
          const cities = await apiFetch<GeographyCity[]>(
            `/geography/cities?countryId=${encodeURIComponent(
              country.country_id
            )}&regionId=${encodeURIComponent(region.region_id)}`
          );

          citiesByRegionId[region.region_id] = cities.map((city) => ({
            value: city.city_id,
            labelKey: city.city_name,
            meta: city
          }));
        })
      );
    })
  );

  return {
    countries: countryOptions,
    regionsByCountryId,
    citiesByRegionId
  };
}

export function getGeographyOptionsForField(
  geographyLevel: 'country' | 'region' | 'city' | undefined,
  form: Record<string, any>,
  geographyOptions: GeographyOptions
) {
  if (geographyLevel === 'country') {
    return geographyOptions.countries;
  }

  if (geographyLevel === 'region') {
    const countryId = form.country_id;

    if (!countryId) {
      return [];
    }

    return geographyOptions.regionsByCountryId[String(countryId)] || [];
  }

  if (geographyLevel === 'city') {
    const regionId = form.region_id;

    if (!regionId) {
      return [];
    }

    return geographyOptions.citiesByRegionId[String(regionId)] || [];
  }

  return [];
}