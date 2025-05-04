import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiExcludeController(true)
@Controller()
export class AppController {
  @Public()
  @Get()
  getHealthCheck() {
    return { status: 'OK' };
  }
}
