import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOkResponse({ type: String })
  async syncMovies() {
    return this.syncService.syncMovies();
  }
}
