import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createPortBody } from '../interface/createPort';
import { Observable } from 'rxjs';
import { Country } from '../interface/country';
import { State } from '../interface/state';
import { City } from '../interface/city';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  constructor(private http: HttpClient) {}

  public getAllCountries(): Observable<Country[]> {
    const url: string = '/assets/countries.json';
    return this.http.get<Country[]>(url);
  }

  public getAllStates(): Observable<State[]> {
    const url: string = '/assets/states.json';
    return this.http.get<State[]>(url);
  }

  public getAllCities(): Observable<City[]> {
    const url: string = '/assets/cities.json';
    return this.http.get<City[]>(url);
  }

  public createPort(body: createPortBody): Observable<any> {
    const url =
      'https://api.asocks.com/v2/proxy/create-port?apiKey=Tf04WostRnBLjKxOqoF2XXGS69KcCEyW';
    return this.http.post(url, body);
  }
}
