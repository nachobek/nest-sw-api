import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from 'src/sync/services/sync.service';
import { ScheduledTasksService } from './scheduled-tasks.service';

describe('ScheduledTasksService', () => {
  let service: ScheduledTasksService;
  let syncService: SyncService;

  // Create mock for the SyncService
  const mockSyncService = {
    syncMovies: jest.fn().mockResolvedValue(undefined),
  };

  // Spy on the Logger
  beforeEach(() => {
    jest.spyOn(Logger, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledTasksService,
        {
          provide: SyncService,
          useValue: mockSyncService,
        },
      ],
    }).compile();

    service = module.get<ScheduledTasksService>(ScheduledTasksService);
    syncService = module.get<SyncService>(SyncService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduledSyncMovies', () => {
    it('should call syncService.syncMovies and log success', async () => {
      // Arrange. Access the private method for testing.
      const scheduledSyncMovies = (service as any).scheduledSyncMovies.bind(service);

      // Act
      await scheduledSyncMovies();

      // Assert
      expect(syncService.syncMovies).toHaveBeenCalledTimes(1);
      expect(Logger.log).toHaveBeenCalledTimes(2); // Log started and success
      expect(Logger.error).not.toHaveBeenCalled();
    });

    it('should log error when syncMovies fails', async () => {
      // Arrange
      mockSyncService.syncMovies.mockRejectedValueOnce(new Error('Sync failed'));

      // Access the private method for testing
      const scheduledSyncMovies = (service as any).scheduledSyncMovies.bind(service);

      // Act
      await scheduledSyncMovies();

      // Assert
      expect(syncService.syncMovies).toHaveBeenCalledTimes(1);
      expect(Logger.log).toHaveBeenCalledTimes(1); // Only the "started" log
      expect(Logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
