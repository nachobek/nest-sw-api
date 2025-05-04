import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SwApiService } from 'src/external-apis/services/sw-api.service';
import { Source } from 'src/movies/enum/source.enum';
import { CharactersService } from 'src/movies/services/characters.service';
import { MoviesService } from 'src/movies/services/movies.service';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  let service: SyncService;
  let swApiService: SwApiService;
  let moviesService: MoviesService;
  let charactersService: CharactersService;

  // Create mocks for dependencies
  const mockSwApiService = {
    getMovies: jest.fn(),
    getCharacters: jest.fn(),
  };

  const mockMoviesService = {
    forceDeleteAllSwApiMovies: jest.fn(),
    createMany: jest.fn(),
  };

  const mockCharactersService = {
    forceDeleteAllSwApiCharacters: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
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
        {
          provide: CharactersService,
          useValue: mockCharactersService,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    swApiService = module.get<SwApiService>(SwApiService);
    moviesService = module.get<MoviesService>(MoviesService);
    charactersService = module.get<CharactersService>(CharactersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generalSync', () => {
    it('should sync movies and characters successfully', async () => {
      // Arrange
      const mockSwMovies = {
        results: [
          {
            title: 'A New Hope',
            release_date: '1977-05-25',
            url: 'https://swapi.dev/api/films/1/',
            characters: ['https://swapi.dev/api/people/1/'],
          },
          {
            title: 'The Empire Strikes Back',
            release_date: '1980-05-17',
            url: 'https://swapi.dev/api/films/2/',
            characters: ['https://swapi.dev/api/people/1/'],
          },
        ],
      };

      const mockSwCharacters = {
        results: [
          {
            name: 'Luke Skywalker',
            url: 'https://swapi.dev/api/people/1/',
          }
        ],
      };

      const mockMovies = [
        {
          id: 1,
          title: 'A New Hope',
          url: 'https://swapi.dev/api/films/1/',
          setCharacters: jest.fn()
        },
        {
          id: 2,
          title: 'The Empire Strikes Back',
          url: 'https://swapi.dev/api/films/2/',
          setCharacters: jest.fn()
        }
      ];

      mockSwApiService.getMovies.mockResolvedValue(mockSwMovies);
      mockSwApiService.getCharacters.mockResolvedValue(mockSwCharacters);
      mockMoviesService.forceDeleteAllSwApiMovies.mockResolvedValue(undefined);
      mockCharactersService.forceDeleteAllSwApiCharacters.mockResolvedValue(undefined);
      mockMoviesService.createMany.mockResolvedValue(mockMovies);
      mockCharactersService.createMany.mockResolvedValue(undefined);
      mockCharactersService.findAll.mockResolvedValue([
        { id: 1, url: 'https://swapi.dev/api/people/1/' }
      ]);

      // Act
      await service.generalSync();

      // Assert
      expect(mockCharactersService.forceDeleteAllSwApiCharacters).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.forceDeleteAllSwApiMovies).toHaveBeenCalledTimes(1);
      expect(mockSwApiService.getCharacters).toHaveBeenCalledTimes(1);
      expect(mockSwApiService.getMovies).toHaveBeenCalledTimes(1);
      expect(mockCharactersService.createMany).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.createMany).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'A New Hope',
          releaseDate: new Date('1977-05-25'),
          source: Source.SWAPI,
        }),
        expect.objectContaining({
          title: 'The Empire Strikes Back',
          releaseDate: new Date('1980-05-17'),
          source: Source.SWAPI,
        }),
      ]);
      expect(mockMovies[0].setCharacters).toHaveBeenCalledWith([1]);
      expect(mockMovies[1].setCharacters).toHaveBeenCalledWith([1]);
    });

    it('should handle empty movie list', async () => {
      // Arrange
      mockSwApiService.getMovies.mockResolvedValue({ results: [] });
      mockSwApiService.getCharacters.mockResolvedValue({ results: [] });
      mockMoviesService.forceDeleteAllSwApiMovies.mockResolvedValue(undefined);
      mockCharactersService.forceDeleteAllSwApiCharacters.mockResolvedValue(undefined);

      // Act
      await service.generalSync();

      // Assert
      expect(mockMoviesService.forceDeleteAllSwApiMovies).toHaveBeenCalledTimes(1);
      expect(mockCharactersService.forceDeleteAllSwApiCharacters).toHaveBeenCalledTimes(1);
      expect(mockSwApiService.getMovies).toHaveBeenCalledTimes(1);
      expect(mockSwApiService.getCharacters).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.createMany).not.toHaveBeenCalled();
      expect(mockCharactersService.createMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if sync is already running', async () => {
      // Arrange - Start first sync
      mockSwApiService.getMovies.mockResolvedValue({ results: [] });
      mockSwApiService.getCharacters.mockResolvedValue({ results: [] });

      // Add a delay to the first sync
      mockMoviesService.forceDeleteAllSwApiMovies.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      // Start the first sync without awaiting it
      const firstSync = service.generalSync();

      // Act & Assert - Try to start second sync before first completes
      await expect(service.generalSync()).rejects.toThrow(BadRequestException);

      // Wait for first sync to complete
      await firstSync;
    });

    it('should handle errors and reset isSyncRunning flag', async () => {
      // Arrange
      mockSwApiService.getCharacters.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(service.generalSync()).rejects.toThrow(InternalServerErrorException);

      // Make sure the flag is reset so future syncs can run
      expect(Logger.error).toHaveBeenCalled();

      // Should be able to run another sync after error
      mockSwApiService.getCharacters.mockResolvedValue({ results: [] });
      mockSwApiService.getMovies.mockResolvedValue({ results: [] });
      await service.generalSync();
      expect(mockSwApiService.getCharacters).toHaveBeenCalledTimes(2);
    });
  });
});
