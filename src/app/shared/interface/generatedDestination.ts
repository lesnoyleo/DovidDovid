import { PROXY_TYPE } from '../constants/proxyTypeIds';
import { City } from './city';
import { Country } from './country';
import { State } from './state';

export interface GeneratedDestination {
  selectedCountry: Country | null;
  randomOfState: State;
  randomOfCity: City;
}

export interface ExcelInfoRow {
  value: string;
  proxyType: PROXY_TYPE;
}
