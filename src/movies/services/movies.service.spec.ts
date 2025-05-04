import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { Source } from '../enum/source.enum';
import { Movie } from '../models/movie.model';
import { CharactersService } from './characters.service';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;

  // Create a mock for the Movie model
  const mockMovieModel = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
    sequelize: {
      transaction: jest.fn().mockReturnValue({
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      })
    }
  };

  // Create a mock for an individual movie instance
  const mockMovieInstance = {
    id: '1',
    title: 'Star Wars',
    director: 'George Lucas',
    update: jest.fn(),
    destroy: jest.fn(),
    setCharacters: jest.fn().mockResolvedValue(undefined)
  };

  // Create a mock for CharactersService
  const mockCharactersService = {
    findAll: jest.fn()
  };

  beforeEach(async () => {
    jest.spyOn(Logger, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getModelToken(Movie),
          useValue: mockMovieModel,
        },
        {
          provide: CharactersService,
          useValue: mockCharactersService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllMoviesPaginated', () => {
    it('should return paginated movies', async () => {
      // Arrange
      const paginationParams = {
        limit: 10,
        offset: 1,
      } as PaginationParams;

      const movies = [
        { id: '1', title: 'Star Wars' },
        { id: '2', title: 'Empire Strikes Back' },
      ];

      const mockResult = {
        rows: movies,
        count: 2,
      };

      mockMovieModel.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await service.findAllMoviesPaginated(paginationParams);

      // Assert
      expect(result.data).toEqual(movies);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        pageCount: 1,
        total: 2,
      });
      expect(mockMovieModel.findAndCountAll).toHaveBeenCalledWith(paginationParams);
    });
  });

  describe('findOneByPk', () => {
    it('should return a movie if found', async () => {
      // Arrange
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Act
      const result = await service.findOneByPk('1');

      // Assert
      expect(result).toEqual(mockMovieInstance);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            association: 'characters',
            through: { attributes: [] },
          },
        ],
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      // Arrange
      mockMovieModel.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOneByPk('999')).rejects.toThrow(NotFoundException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('999', expect.any(Object));
    });
  });

  describe('create', () => {
    it('should create and return a new movie', async () => {
      // Arrange
      const newMovie: CreateMovieDto = {
        title: 'Return of the Jedi',
        director: 'Richard Marquand',
        producer: 'Howard Kazanjian',
        releaseDate: new Date('1983-05-25'),
        episodeId: 6,
        openingCrawl: 'Luke Skywalker has returned to...',
        url: 'https://swapi.dev/api/films/3/',
        source: Source.INTERNAL,
        characters: [1, 2]
      };

      const characters = [
        { id: 1, name: 'Luke' },
        { id: 2, name: 'Leia' }
      ];

      mockCharactersService.findAll.mockResolvedValue(characters);

      const createdMovie = {
        id: '3',
        ...newMovie,
        setCharacters: jest.fn().mockResolvedValue(undefined)
      };
      mockMovieModel.create.mockResolvedValue(createdMovie);

      // Act
      const result = await service.create(newMovie);

      // Assert
      expect(result).toEqual(createdMovie);
      expect(mockMovieModel.create).toHaveBeenCalledWith(newMovie, expect.any(Object));
      expect(createdMovie.setCharacters).toHaveBeenCalledWith([1, 2], expect.any(Object));
    });

    it('should throw BadRequestException if characters not found', async () => {
      // Arrange
      const newMovie: CreateMovieDto = {
        title: 'Return of the Jedi',
        director: 'Richard Marquand',
        url: 'https://swapi.dev/api/films/3/',
        source: Source.SWAPI,
        characters: [1, 2, 3]
      };

      // Only return 2 characters when 3 were requested
      mockCharactersService.findAll.mockResolvedValue([
        { id: 1, name: 'Luke' },
        { id: 2, name: 'Leia' }
      ]);

      // Act & Assert
      await expect(service.create(newMovie)).rejects.toThrow(BadRequestException);
      expect(mockCharactersService.findAll).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      // Arrange
      const newMovie: CreateMovieDto = {
        title: 'Return of the Jedi',
        director: 'Richard Marquand',
        url: 'https://swapi.dev/api/films/3/',
        source: Source.SWAPI,
        characters: []
      };

      mockMovieModel.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(newMovie)).rejects.toThrow(InternalServerErrorException);
      expect(mockMovieModel.create).toHaveBeenCalledWith(newMovie, expect.any(Object));
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('should create multiple movies in bulk', async () => {
      // Arrange
      const movies = [
        {
          title: 'A New Hope',
          director: 'George Lucas',
          source: Source.SWAPI,
        },
        {
          title: 'The Empire Strikes Back',
          director: 'Irvin Kershner',
          source: Source.SWAPI,
        },
      ];

      const createdMovies = [
        { id: '1', ...movies[0] },
        { id: '2', ...movies[1] },
      ];

      mockMovieModel.bulkCreate.mockResolvedValue(createdMovies);

      // Act
      const result = await service.createMany(movies);

      // Assert
      expect(result).toEqual(createdMovies);
      expect(mockMovieModel.bulkCreate).toHaveBeenCalledWith(movies);
    });
  });

  describe('updateByPk', () => {
    it('should update and return the movie with new values', async () => {
      // Arrange
      const updateData: UpdateMovieDto = {
        title: 'Updated Title',
        director: 'Updated Director',
        characters: [1, 2]
      };

      // Mock findByPk through the service
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Characters found
      mockCharactersService.findAll.mockResolvedValue([
        { id: 1, name: 'Luke' },
        { id: 2, name: 'Leia' }
      ]);

      // Create an updated movie object with the expected properties
      const updatedMovie = {
        ...mockMovieInstance,
        title: 'Updated Title',
        director: 'Updated Director',
        characters: [1, 2],
      };

      // Simulate the model's update behavior by updating the object's properties
      mockMovieInstance.update.mockImplementation(() => {
        mockMovieInstance.title = updateData.title;
        mockMovieInstance.director = updateData.director;
        return Promise.resolve(mockMovieInstance);
      });

      // Act
      const result = await service.updateByPk('1', updateData);

      // Assert
      expect(result.title).toBe(updatedMovie.title);
      expect(result.director).toBe(updatedMovie.director);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockMovieInstance.update).toHaveBeenCalledWith(updateData, expect.any(Object));
      expect(mockMovieInstance.setCharacters).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if characters not found', async () => {
      // Arrange
      const updateData: UpdateMovieDto = {
        title: 'Updated Title',
        characters: [1, 2, 3]
      };

      // Mock findByPk to return our movie instance
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Only return 2 characters when 3 were requested
      mockCharactersService.findAll.mockResolvedValue([
        { id: 1, name: 'Luke' },
        { id: 2, name: 'Leia' }
      ]);

      // Act & Assert
      await expect(service.updateByPk('1', updateData)).rejects.toThrow(BadRequestException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockCharactersService.findAll).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      // Arrange
      const updateData: UpdateMovieDto = { title: 'Updated Title' };

      // Mock findByPk to return our movie instance
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Mock update to throw an error
      mockMovieInstance.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.updateByPk('1', updateData)).rejects.toThrow(InternalServerErrorException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockMovieInstance.update).toHaveBeenCalledWith(updateData, expect.any(Object));
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteByPk', () => {
    it('should delete a movie successfully', async () => {
      // Arrange
      // Mock findByPk to return our movie instance
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Mock successful deletion
      mockMovieInstance.destroy.mockResolvedValue(undefined);

      // Act
      await service.deleteByPk('1');

      // Assert
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockMovieInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if movie to delete is not found', async () => {
      // Arrange
      mockMovieModel.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteByPk('999')).rejects.toThrow(NotFoundException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('999', expect.any(Object));
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      // Arrange
      // Mock findByPk to return our movie instance
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Mock destroy to throw an error
      mockMovieInstance.destroy.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.deleteByPk('1')).rejects.toThrow(InternalServerErrorException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockMovieInstance.destroy).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('forceDeleteAllSwApiMovies', () => {
    it('should delete all SWAPI movies', async () => {
      // Arrange
      mockMovieModel.destroy.mockResolvedValue(5); // 5 movies deleted

      // Act
      await service.forceDeleteAllSwApiMovies();

      // Assert
      expect(mockMovieModel.destroy).toHaveBeenCalledWith({
        where: { source: Source.SWAPI },
        force: true,
      });
    });

    it('should throw InternalServerErrorException if bulk deletion fails', async () => {
      // Arrange
      mockMovieModel.destroy.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.forceDeleteAllSwApiMovies()).rejects.toThrow(InternalServerErrorException);
      expect(mockMovieModel.destroy).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
