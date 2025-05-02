import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationParams } from 'src/common/classes/pagination-params.class';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { Source } from '../enum/source.enum';
import { Movie } from '../models/movie.model';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;

  // Create a mock for the Movie model
  const mockMovieModel = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
  };

  // Create a mock for an individual movie instance
  const mockMovieInstance = {
    id: '1',
    title: 'Star Wars',
    director: 'George Lucas',
    update: jest.fn(),
    destroy: jest.fn(),
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
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      // Arrange
      mockMovieModel.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOneByPk('999')).rejects.toThrow(NotFoundException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('999');
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
        source: Source.INTERNAL,
      };

      const createdMovie = { id: '3', ...newMovie };
      mockMovieModel.create.mockResolvedValue(createdMovie);

      // Act
      const result = await service.create(newMovie);

      // Assert
      expect(result).toEqual(createdMovie);
      expect(mockMovieModel.create).toHaveBeenCalledWith(newMovie);
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
      // Arrange
      const newMovie: CreateMovieDto = {
        title: 'Return of the Jedi',
        director: 'Richard Marquand',
        producer: 'Howard Kazanjian',
        releaseDate: new Date('1983-05-25'),
        episodeId: 6,
        openingCrawl: 'Luke Skywalker has returned to...',
        source: Source.INTERNAL,
      };

      mockMovieModel.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(newMovie)).rejects.toThrow(InternalServerErrorException);
      expect(mockMovieModel.create).toHaveBeenCalledWith(newMovie);
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
      };

      const updatedMovie = {
        ...mockMovieInstance,
        ...updateData,
      };

      // Mock findByPk to return our movie instance
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Mock the update method on the instance to return the updated movie
      mockMovieInstance.update.mockResolvedValue(updatedMovie);

      // Act
      const result = await service.updateByPk('1', updateData);

      // Assert
      expect(result).toEqual(updatedMovie);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1');
      expect(mockMovieInstance.update).toHaveBeenCalledWith(updateData);
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
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1');
      expect(mockMovieInstance.update).toHaveBeenCalledWith(updateData);
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
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1');
      expect(mockMovieInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if movie to delete is not found', async () => {
      // Arrange
      mockMovieModel.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteByPk('999')).rejects.toThrow(NotFoundException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('999');
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      // Arrange
      // Mock findByPk to return our movie instance
      mockMovieModel.findByPk.mockResolvedValue(mockMovieInstance);

      // Mock destroy to throw an error
      mockMovieInstance.destroy.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.deleteByPk('1')).rejects.toThrow(InternalServerErrorException);
      expect(mockMovieModel.findByPk).toHaveBeenCalledWith('1');
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
