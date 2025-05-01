import { SwApiFilm } from './sw-api-film.interface';

export interface SwApiResponse {
  count: number;
  next: string;
  previous: string;
  results: SwApiFilm[];
}
