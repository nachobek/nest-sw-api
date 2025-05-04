import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as https from 'https';
import { firstValueFrom } from 'rxjs';
import { SwApiCharacter } from '../interfaces/sw-api-character.interface';
import { SwApiFilm } from '../interfaces/sw-api-film.interface';
import { SwApiResponse } from '../interfaces/sw-api-response.interface';

@Injectable()
export class SwApiService {
  private readonly swApiUrl = process.env.SW_API_BASE_URL;
  private httpsAgent: https.Agent;

  constructor(private readonly httpService: HttpService) {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  async getMovies(): Promise<SwApiResponse<SwApiFilm>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SwApiResponse<SwApiFilm>>(`${this.swApiUrl}/films`, {
          httpsAgent: this.httpsAgent,
        }),
      );

      return response.data;
    } catch (error) {
      Logger.error(error);
      throw this.parseError(error);
    }
  }

  async getCharacters(): Promise<SwApiResponse<SwApiCharacter>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SwApiResponse<SwApiCharacter>>(`${this.swApiUrl}/people`, {
          httpsAgent: this.httpsAgent,
        }),
      );

      return response.data;
    } catch (error) {
      Logger.error(error);
      throw this.parseError(error);
    }
  }

  private parseError(error: any) {
    const { response } = error;

    let exception: HttpException;

    switch (response.status) {
      case HttpStatus.BAD_REQUEST:
        exception = new BadRequestException(response.data?.message || response.statusText);
        break;
      case HttpStatus.UNAUTHORIZED:
        exception = new UnauthorizedException(response.data?.message || response.statusText);
        break;
      default:
        exception = new InternalServerErrorException();
        break;
    }

    return exception;
  }
}
