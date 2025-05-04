import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import Role from 'src/common/enums/role.enum';
import { User } from '../models/user.model';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  // Create a mock for the User model
  const mockUserModel = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Simple test for findOneByPk method
  describe('findOneByPk', () => {
    it('should return a user when found', async () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com' };
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOneByPk(1);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com' };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOneByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        role: Role.USER,
        firstName: 'New',
        lastName: 'User',
      };
      const mockUser = { id: 2, ...userData };
      mockUserModel.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toEqual(mockUser);
      // Note: We don't check the exact password here since it should be hashed
      expect(mockUserModel.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      // Arrange
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'User'
      };

      // Create a custom user mock for this test
      const userToUpdate = {
        id: 1,
        email: 'test@example.com',
        role: Role.USER,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        update: jest.fn().mockImplementation(function(data) {
          const updateData = data.updateUserDto || data;
          Object.assign(this, updateData);
          return Promise.resolve(this);
        }),
      } as unknown as User;

      // Act
      const result = await service.update(userToUpdate, updateUserDto);

      // Assert
      expect(result.firstName).toEqual('Updated');
      expect(result.lastName).toEqual('User');
      expect(userToUpdate.update).toHaveBeenCalled();
    });
  });

  describe('forceDestroyUserByPk', () => {
    it('should call destroy with the correct parameters', async () => {
      // Arrange
      mockUserModel.destroy.mockResolvedValue(1); // 1 record deleted

      // Act
      await service.forceDestroyUserByPk(1);

      // Assert
      expect(mockUserModel.destroy).toHaveBeenCalledWith({
        where: { id: 1 },
        force: true,
      });
    });
  });
});
