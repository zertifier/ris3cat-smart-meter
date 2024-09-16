import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {firstValueFrom, map} from "rxjs";
import {HttpResponse} from "@shared/infrastructure/services/HttpResponse";
import {Comparison} from "@shared/utils/Sorting";
import {City, compareCategory, getCategoryForId, Stats, Weather} from './OpenWeather';

export interface PredictionResponse {
  list: {
    dt: number,
    main: Stats,
    weather: Weather[],
    clouds: {
      all: number
    },
    wind: {
      speed: number,
      deg: number,
      gust: number
    },
    visibility: number,
    pop: number,
    rain: {
      "3h": number
    },
    sys: {
      pod: string
    },
    dt_txt: string
  }[],
  city: City,
}

@Injectable({
  providedIn: 'root'
})
export class WeatherPredictionService {

  constructor(private httpClient: HttpClient) {
  }

  public async getPrediction(): Promise<Map<string, Weather>> {
    const response = this.httpClient.get<HttpResponse<PredictionResponse>>(`${environment.zertipower_url}/weather-prediction`)
    const prediction = await firstValueFrom(response.pipe(map(r => r.data)));

    const hourlyWeather: Map<string, Weather[]> = new Map<string, Weather[]>();
    // Organize prediction by day
    for (const p of prediction.list) {
      const dailyDate = p.dt_txt.split(" ")[0];
      const weatherList: Weather[] = hourlyWeather.get(dailyDate) || [];
      weatherList.push(...p.weather);
      hourlyWeather.set(dailyDate, weatherList);
    }

    console.log({hourlyWeather});

    const dailyWeather: Map<string, Weather> = new Map<string, Weather>();
    // Sort predictions
    for (const [day, weatherList] of hourlyWeather.entries()) {
      this.sortWeatherList(weatherList);
      dailyWeather.set(day, weatherList[0]);
    }

    // Get extreme prediction of each day
    return dailyWeather;
  }

  /**
   * Sorts a list of OpenWeather.Weather. It mutates the original array.
   * @param weatherList
   * @private
   */
  private sortWeatherList(weatherList: Weather[]) {
    for (let i = weatherList.length - 1; i >= 0; i--) {
      for (let j = 0; j < i; j++) {
        const a = getCategoryForId(weatherList[j].id)
        const b = getCategoryForId(weatherList[j + 1].id)
        if (compareCategory(a, b) === Comparison.LOWER) {
          const swap = weatherList[j]
          weatherList[j] = weatherList[j + 1]
          weatherList[j + 1] = swap
        }
        if (compareCategory(a, b) === Comparison.EQUAL) {
          if (weatherList[j].id < weatherList[j + 1].id) {
            const swap = weatherList[j]
            weatherList[j] = weatherList[j + 1]
            weatherList[j + 1] = swap
          }
        }
      }
    }
  }

}
