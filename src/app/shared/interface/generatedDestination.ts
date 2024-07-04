import { City } from './city';
import { Country } from './country';
import { State } from './state';

export interface GeneratedDestination {
  selectedCountry: Country | null;
  randomOfState: State;
  randomOfCity: City;
}
