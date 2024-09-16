import {Comparison} from "@shared/utils/Sorting";

export enum WeatherCategory {
  CLEAR = 0,
  CLOUDS = 1,
  DRIZZLE = 2,
  RAIN = 3,
  SNOW = 4,
  ATMOSPHERE = 5,
  EXTREME = 6
}

export function getCategoryForId(id: number): WeatherCategory {
  // Checking if it is thunder or tornado (781)
  if ((id >= 200 && id <= 232) || id === 781) {
    return WeatherCategory.EXTREME;
  }

  if (id >= 701 && id <= 771) {
    return WeatherCategory.ATMOSPHERE;
  }

  if (id >= 600 && id <= 622) {
    return WeatherCategory.SNOW;
  }

  if (id >= 500 && id <= 531) {
    return WeatherCategory.RAIN;
  }

  if (id >= 300 && id <= 321) {
    return WeatherCategory.DRIZZLE;
  }

  if (id >= 801 && id <= 804) {
    return WeatherCategory.CLOUDS;
  }

  return WeatherCategory.CLEAR
}

export function compareCategory(catA: WeatherCategory, catB: WeatherCategory): Comparison {
  if (catA > catB) {
    return Comparison.HIGHER
  }

  if (catA < catB) {
    return Comparison.LOWER
  }

  return Comparison.EQUAL
}

export interface Weather {
  id: number,
  main: string,
  description: string,
  icon: string
}

export interface Stats {
  temp: number,
  feels_like: number,
  temp_min: number,
  temp_max: number,
  pressure: number,
  sea_level: number,
  grnd_level: number,
  humidity: number,
  temp_kf: number
}

export interface City {
  id: number,
  name: string,
  coord: {
    lat: number,
    lon: number
  },
  country: string,
  population: number,
  timezone: number,
  sunrise: number,
  sunset: number
}

