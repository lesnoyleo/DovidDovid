import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainService } from './shared/services/mainService.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Country } from './shared/interface/country';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  finalize,
  map,
  startWith,
  tap,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { City } from './shared/interface/city';
import { State } from './shared/interface/state';
import { GeneratedDestination } from './shared/interface/generatedDestination';
import { HttpClientService } from './shared/services/httpClient.service';
import { createPortBody } from './shared/interface/createPort';
import { PROXY_TYPE_IDS } from './shared/constants/proxyTypeIds';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent implements OnInit {
  title = 'DovidDovid';
  mainService = inject(MainService);
  httpClientService = inject(HttpClientService);

  public countryControl = new FormControl<Country | null>(
    null,
    Validators.required
  );
  public proxyTypeIdControl = new FormControl<number | null>(
    1,
    Validators.required
  );
  public countries$ = new BehaviorSubject<Country[]>([]);
  public states$ = new BehaviorSubject<State[]>([]);
  public cities$ = new BehaviorSubject<City[]>([]);
  public filteredCountries$ = new BehaviorSubject<Country[]>([]);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public proxyTypeIds = PROXY_TYPE_IDS;

  constructor() {}

  public ngOnInit(): void {
    this.mainService.getAllCountries().subscribe((countries) => {
      this.countries$.next(countries);
      this.filteredCountries$.next(countries);
    });
    this.mainService.getAllStates().subscribe((states) => {
      this.states$.next(states);
    });
    this.mainService.getAllCities().subscribe((cities) => {
      this.cities$.next(cities);
    });
    this.countryControl.valueChanges
      .pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : value?.name;
          this.filteredCountries$.next(
            name ? this.filter(name as string) : this.countries$.value.slice()
          );
        })
      )
      .subscribe();
  }

  public onGenerateRandomAddress(): void {
    this.isLoading$.next(true);
    const selectedCountry = this.countryControl.value;
    const result = this.generateRandomAddress(selectedCountry);

    const body: createPortBody = {
      country_code: result.selectedCountry?.code,
      state: result.randomOfState.name,
      city: result.randomOfCity.name,
      asn: 0,
      type_id: 2,
      proxy_type_id: this.proxyTypeIdControl.value,
      name: null,
      server_port_type_id: 0,
    };

    this.httpClientService
      .createPort(body)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe(console.log);
  }

  public generateRandomAddress(
    selectedCountry: Country | null
  ): GeneratedDestination {
    const pullOfStates = this.states$.value.filter(
      (state) => state.dir_country_id === selectedCountry?.id
    );
    const randomIndexOfState = Math.floor(Math.random() * pullOfStates.length);
    const randomOfState = pullOfStates[randomIndexOfState];
    const pullOfCities = this.cities$.value.filter(
      (city) => city.dir_state_id === randomOfState.id
    );
    const randomIndexOfCity = Math.floor(Math.random() * pullOfCities.length);
    const randomOfCity = pullOfCities[randomIndexOfCity];
    return {
      selectedCountry,
      randomOfState,
      randomOfCity,
    };
  }

  public displayFn(country: Country): string {
    return country && country.name ? country.name : '';
  }

  private filter(name: string): Country[] {
    const filterValue = name.toLowerCase();

    return this.countries$.value.filter((country) =>
      country.name.toLowerCase().includes(filterValue)
    );
  }
}
