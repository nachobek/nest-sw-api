import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SwApiService } from 'src/external-apis/services/sw-api.service';
import { Source } from 'src/movies/enum/source.enum';
import { MoviesService } from 'src/movies/services/movies.service';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  let service: SyncService;
  let swApiService: SwApiService;
  let moviesService: MoviesService;

  // Create mocks for dependencies
  const mockSwApiService = {
    getMovies: jest.fn(),
  };

  const mockMoviesService = {
    forceDeleteAllSwApiMovies: jest.fn(),
    createMany: jest.fn(),
  };

  beforeEach(async () => {
    jest.spyOn(Logger, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: SwApiService,
          useValue: mockSwApiService,
        },
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    swApiService = module.get<SwApiService>(SwApiService);
    moviesService = module.get<MoviesService>(MoviesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncMovies', () => {
    it('should sync movies successfully', async () => {
      // Arrange
      const mockSwMovies = {
        results: [
          {
            title: 'A New Hope',
            release_date: '1977-05-25',
          },
          {
            title: 'The Empire Strikes Back',
            release_date: '1980-05-17',
          },
        ],
      };

      mockSwApiService.getMovies.mockResolvedValue(mockSwMovies);
      mockMoviesService.forceDeleteAllSwApiMovies.mockResolvedValue(undefined);
      mockMoviesService.createMany.mockResolvedValue(undefined);

      // Act
      await service.syncMovies();

      // Assert
      expect(mockMoviesService.forceDeleteAllSwApiMovies).toHaveBeenCalledTimes(1);
      expect(mockSwApiService.getMovies).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.createMany).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.createMany).toHaveBeenCalledWith([
        {
          title: 'A New Hope',
          releaseDate: new Date('1977-05-25'),
          source: Source.SWAPI,
        },
        {
          title: 'The Empire Strikes Back',
          releaseDate: new Date('1980-05-17'),
          source: Source.SWAPI,
        },
      ]);
      expect(Logger.log).toHaveBeenCalledTimes(2);
    });

    it('should skip movies with missing title', async () => {
      // Arrange
      const mockSwMovies = {
        results: [
          {
            // Missing title
            release_date: '1977-05-25',
          },
          {
            title: 'The Empire Strikes Back',
            release_date: '1980-05-17',
          },
        ],
      };

      mockSwApiService.getMovies.mockResolvedValue(mockSwMovies);
      mockMoviesService.forceDeleteAllSwApiMovies.mockResolvedValue(undefined);
      mockMoviesService.createMany.mockResolvedValue(undefined);

      // Act
      await service.syncMovies();

      // Assert
      expect(mockMoviesService.createMany).toHaveBeenCalledWith([
        {
          title: 'The Empire Strikes Back',
          releaseDate: new Date('1980-05-17'),
          source: Source.SWAPI,
        },
      ]);
    });

    it('should skip movies with invalid release date', async () => {
      // Arrange
      const mockSwMovies = {
        results: [
          {
            title: 'A New Hope',
            release_date: 'invalid-date', // Invalid date
          },
          {
            title: 'The Empire Strikes Back',
            release_date: '1980-05-17',
          },
        ],
      };

      mockSwApiService.getMovies.mockResolvedValue(mockSwMovies);
      mockMoviesService.forceDeleteAllSwApiMovies.mockResolvedValue(undefined);
      mockMoviesService.createMany.mockResolvedValue(undefined);

      // Act
      await service.syncMovies();

      // Assert
      expect(mockMoviesService.createMany).toHaveBeenCalledWith([
        {
          title: 'The Empire Strikes Back',
          releaseDate: new Date('1980-05-17'),
          source: Source.SWAPI,
        },
      ]);
    });

    it('should throw BadRequestException if sync is already running', async () => {
      // Arrange - Start first sync
      mockSwApiService.getMovies.mockResolvedValue({ results: [] });

      // Add a delay to the first sync
      mockMoviesService.forceDeleteAllSwApiMovies.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      // Start the first sync without awaiting it
      const firstSync = service.syncMovies();

      // Act & Assert - Try to start second sync before first completes
      await expect(service.syncMovies()).rejects.toThrow(BadRequestException);

      // Wait for first sync to complete
      await firstSync;
    });

    it('should handle empty movie list', async () => {
      // Arrange
      mockSwApiService.getMovies.mockResolvedValue({ results: [] });
      mockMoviesService.forceDeleteAllSwApiMovies.mockResolvedValue(undefined);

      // Act
      await service.syncMovies();

      // Assert
      expect(mockMoviesService.forceDeleteAllSwApiMovies).toHaveBeenCalledTimes(1);
      expect(mockSwApiService.getMovies).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.createMany).not.toHaveBeenCalled();
    });

    it('should handle errors and reset isSyncRunning flag', async () => {
      // Arrange
      mockSwApiService.getMovies.mockRejectedValue(new Error());

      // Act & Assert
      await expect(service.syncMovies()).rejects.toThrow(InternalServerErrorException);

      // Make sure the flag is reset so future syncs can run
      expect(Logger.error).toHaveBeenCalled();

      // Should be able to run another sync after error
      mockSwApiService.getMovies.mockResolvedValue({ results: [] });
      await service.syncMovies();
      expect(mockSwApiService.getMovies).toHaveBeenCalledTimes(2);
    });
  });
});
