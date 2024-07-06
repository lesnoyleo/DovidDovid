import { City } from '../interface/city';
import { Country } from '../interface/country';
import { GeneratedDestination } from '../interface/generatedDestination';
import { State } from '../interface/state';

export function generateRandomAddress(
  selectedCountry: Country | null,
  states: State[],
  cities: City[]
): GeneratedDestination {
  const pullOfStates = states.filter(
    (state) => state.dir_country_id === selectedCountry?.id
  );
  const randomOfState = getRanodmItem(pullOfStates);
  const pullOfCities = cities.filter(
    (city) => city.dir_state_id === randomOfState.id
  );
  const randomOfCity = getRanodmItem(pullOfCities);
  return {
    selectedCountry,
    randomOfState,
    randomOfCity,
  };
}

export function getRanodmItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}
