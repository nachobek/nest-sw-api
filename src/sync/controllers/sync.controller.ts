import { Controller, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponseDecorator } from 'src/common/decorators/api-standard-response.decorator';
import ResponseMessages from 'src/common/enums/response-messages.enum';
import Role from 'src/common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { SyncService } from '../services/sync.service';
@Controller('sync')
@ApiTags('sync')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('movies')
  @ApiOperation({
    summary: '[Admin]',
    description: 'Triggers a manual sync of movies from the SW API',
  })
  @ApiStandardResponseDecorator({
    status: HttpStatus.OK,
    message: ResponseMessages.MANUAL_MOVIE_SYNC_TRIGGERED,
  })
  async syncMovies() {
    Logger.log(ResponseMessages.MANUAL_MOVIE_SYNC_TRIGGERED, 'SyncController');

    this.syncService.generalSync()
      .then(() => {
        Logger.log(ResponseMessages.MANUAL_MOVIE_SYNC_SUCCESS, 'SyncController');
      })
      .catch(() => {
        Logger.error(ResponseMessages.MANUAL_MOVIE_SYNC_ERROR, 'SyncController');
      });

    return {
      statusCode: HttpStatus.OK,
      message: ResponseMessages.MANUAL_MOVIE_SYNC_TRIGGERED,
    };
  }
}
