import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import Role from 'src/common/enums/role.enum';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token when login is successful', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      // Mock findOneByEmail to return the user
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return true (password is valid)
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('test-jwt-token');

      // Act
      const result = await service.signIn('test@example.com', 'password123');

      // Assert
      expect(result).toEqual({ accessToken: 'test-jwt-token' });
    });
  });

  describe('signUp', () => {
    it('should create a new user and return access token', async () => {
      // Arrange
      const signUpDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: Role.USER,
      };

      const mockCreatedUser = {
        id: 2,
        email: 'new@example.com',
        password: 'hashedPassword'
      };

      // Important: First return null for email check, then return the created user for signin
      mockUsersService.findOneByEmail
        .mockResolvedValueOnce(null)  // First call (email check) returns null
        .mockResolvedValueOnce(mockCreatedUser); // Second call (in signIn) returns the created user

      mockUsersService.createUser.mockResolvedValue(mockCreatedUser);

      // Mock bcrypt.compare to return true for the password check in signIn
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('new-user-token');

      // Act
      const result = await service.signUp(signUpDto);

      // Assert
      expect(result).toEqual({ accessToken: 'new-user-token' });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw error when email is already in use', async () => {
      // Arrange
      const signUpDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        role: Role.USER,
      };
      mockUsersService.findOneByEmail.mockResolvedValue({ id: 3, email: 'existing@example.com' });

      // Act & Assert
      await expect(service.signUp(signUpDto)).rejects.toThrow(BadRequestException);
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(mockUsersService.createUser).not.toHaveBeenCalled();
    });
  });
});
