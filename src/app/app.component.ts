import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Country } from './shared/interface/country';
import {
  BehaviorSubject,
  Observable,
  filter,
  finalize,
  forkJoin,
  map,
  startWith,
  tap,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { City } from './shared/interface/city';
import { State } from './shared/interface/state';
import {
  ExcelInfoRow,
  GeneratedDestination,
} from './shared/interface/generatedDestination';
import { HttpClientService } from './shared/services/httpClient.service';
import { createPortBody } from './shared/interface/createPort';
import { PROXY_TYPE, PROXY_TYPE_IDS } from './shared/constants/proxyTypeIds';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { XlsxjsService } from './shared/services/xlsxJs.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { generateRandomAddress } from './shared/utils/utils.functions';

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
  httpClientService = inject(HttpClientService);
  xlsxjsService = inject(XlsxjsService);
  destroyRef = inject(DestroyRef);

  public countries$ = new BehaviorSubject<Country[]>([]);
  public states$ = new BehaviorSubject<State[]>([]);
  public cities$ = new BehaviorSubject<City[]>([]);
  public filteredCountries$ = new BehaviorSubject<Country[]>([]);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public proxyTypeIds = PROXY_TYPE_IDS;
  public form = new FormGroup({
    countryControl: new FormControl<Country | null>(null, Validators.required),
    proxyTypeIdControl: new FormControl<PROXY_TYPE[] | null>(
      [PROXY_TYPE.RESIDENTIAL],
      Validators.required
    ),
    residentalCountControl: new FormControl<number | null>(
      0,
      Validators.required
    ),
    mobileCountControl: new FormControl<number | null>(0, Validators.required),
  });

  public get displayResidentalCountControl(): boolean {
    return !!this.form.controls.proxyTypeIdControl.value?.find(
      (value) => value === PROXY_TYPE.RESIDENTIAL
    );
  }

  public get displayMobileCountControl(): boolean {
    return !!this.form.controls.proxyTypeIdControl.value?.find(
      (value) => value === PROXY_TYPE.MOBILE
    );
  }

  public ngOnInit(): void {
    this.initSubjects();
    this.subscribeToControls();
  }

  public createRandomPorts(): void {
    this.isLoading$.next(true);

    const selectedCountry = this.form.controls.countryControl.value;
    const residentalCount =
      this.form.controls.residentalCountControl.value || 0;
    const mobileCount = this.form.controls.mobileCountControl.value || 0;

    let mergeResidentalObservables = new Array<Observable<any>>();
    let mergeMobileObservables = new Array<Observable<any>>();

    for (let index = 0; index < residentalCount; index++) {
      const randomAddress = generateRandomAddress(
        selectedCountry,
        this.states$.value,
        this.cities$.value
      );
      mergeResidentalObservables.push(
        this.createPort(randomAddress, PROXY_TYPE.RESIDENTIAL)
      );
    }

    for (let index = 0; index < mobileCount; index++) {
      const randomAddress = generateRandomAddress(
        selectedCountry,
        this.states$.value,
        this.cities$.value
      );
      mergeMobileObservables.push(
        this.createPort(randomAddress, PROXY_TYPE.MOBILE)
      );
    }

    forkJoin([
      ...mergeResidentalObservables,
      ...mergeMobileObservables,
    ]).subscribe((values) => {
      const someString: ExcelInfoRow[] = [];
      values.forEach((value, i) =>
        someString.push(
          this.combineExcelInfoCell(
            value.data,
            i > mergeResidentalObservables.length - 1
              ? PROXY_TYPE.MOBILE
              : PROXY_TYPE.RESIDENTIAL
          )
        )
      );
      this.xlsxjsService.generateExcelFile(someString);
    });
  }

  private combineExcelInfoCell(
    response: any,
    proxyType: PROXY_TYPE
  ): ExcelInfoRow {
    return {
      value: `${response?.login}:${response?.password}@${response?.server}:${response?.port}`,
      proxyType,
    };
  }

  private createPort(
    destination: GeneratedDestination,
    proxyTypeId: PROXY_TYPE
  ): Observable<any> {
    const body: createPortBody = {
      country_code: destination.selectedCountry?.code,
      state: destination.randomOfState.name,
      city: destination.randomOfCity.name,
      asn: 0,
      type_id: 2,
      proxy_type_id: proxyTypeId,
      name: `${proxyTypeId === 1 ? 'Res' : 'Mob'}${
        destination.selectedCountry?.name
      } - ${destination.randomOfCity.name}`,
      server_port_type_id: 0,
    };

    return this.httpClientService
      .createPort(body)
      .pipe(finalize(() => this.isLoading$.next(false)));
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

  private initSubjects(): void {
    this.httpClientService.getAllCountries().subscribe((countries) => {
      this.countries$.next(countries);
      this.filteredCountries$.next(countries);
    });
    this.httpClientService.getAllStates().subscribe((states) => {
      this.states$.next(states);
    });
    this.httpClientService.getAllCities().subscribe((cities) => {
      this.cities$.next(cities);
    });
  }

  private subscribeToControls(): void {
    this.form.controls.countryControl.valueChanges
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

    this.form.controls.proxyTypeIdControl.valueChanges
      .pipe(
        filter((value) => !!value),
        tap((value) =>
          value?.find((value) => value === PROXY_TYPE.MOBILE)
            ? this.form.controls.residentalCountControl.setValue(0)
            : this.form.controls.mobileCountControl.setValue(0)
        )
      )
      .subscribe();

    this.xlsxjsService.excelFileGenerateFinish
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.form.reset())
      )
      .subscribe();
  }
}
