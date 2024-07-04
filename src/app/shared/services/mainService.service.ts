import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { City } from '../interface/city';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country } from '../interface/country';
import { State } from '../interface/state';

@Injectable({
  providedIn: 'root',
})
export class MainService {
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
}
