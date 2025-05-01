import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { status, json } = this.prepareException(exception);

    Logger.error(
      `Source IP: ${request.ip} - Status: ${status} - Message: ${exception.message}`,
      'HttpException',
    );

    response.status(status).send(json);
  }

  prepareException(exc: Error) {
    const error =
      exc instanceof HttpException ? exc : new InternalServerErrorException(exc.message);
    const status = error.getStatus();
    const response = error.getResponse();
    const json = typeof response === 'string' ? { error: response } : response;
    return { status, json };
  }
}
