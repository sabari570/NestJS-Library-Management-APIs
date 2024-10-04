import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { REQUEST } from '@nestjs/core';
import { User } from '@prisma/client';
import { Message } from 'src/constants/message.constants';
import * as bcrypt from 'bcrypt';
import UserInterface from './interface/user.interface';
import { Role } from './enums/role-status.enum';
import { StringService } from '../../helpers/string.service';
import { MetaDataDto } from './dto/dto';
import { MetaDataService } from 'src/meta-data/meta-data.service';
import { ModuleNames } from 'src/meta-data/enums/modules.enum';
import { UserAllResDto, UserResDto } from './dto/user-response.dto';
import ReturnMetaData from 'src/meta-data/interfaces/return-meta-data.interface';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  private currentUser: UserInterface;
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly loggerService: Logger,
    private readonly stringService: StringService,
    private readonly metaDataService: MetaDataService,
    @Inject(REQUEST) private readonly request: any,
  ) {
    this.currentUser = {};
  }

  async setCurrentUser(id: string) {
    try {
      const userId = parseInt(id);
      if (!isNaN(userId)) {
        const userResponse: UserResDto = await this.findUserById(userId);
        if (userResponse) {
          this.currentUser = {
            id: userResponse.id.toString(),
            name: userResponse.name,
            email: userResponse.email,
            role: userResponse.role === 'ADMIN' ? Role.ADMIN : Role.USER,
          };
        }
        return this.currentUser;
      }
    } catch (error) {
      this.loggerService.error(
        `setCurrentUser >  error - failed to getUserById, ${id}`,
      );
    }
  }

  getCurrentUser(): UserInterface {
    return this.currentUser;
  }

  async recordExist(id?, field?): Promise<Boolean> {
    return this.usersRepository.recordExist(id, field);
  }
  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findByEmail(email);
  }

  async findUserById(id: number): Promise<UserResDto> {
    this.loggerService.log(`UserService > findUserById(): called for id: ${id}`);
    const userRecord = await this.usersRepository.findUserById(id);
    if (!userRecord) {
      this.loggerService.warn(`User > findUserById ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `User with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }
    this.loggerService.log(`User >  findUserById(): success`);
    return new UserResDto(userRecord);
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, role } = createUserDto;
    this.loggerService.log(
      `UserService > create(): called for email: ${email}`,
    );

    if (!email || !password || !name) {
      this.loggerService.warn(
        `UserService > create(): No body is passed for cretaing an user`,
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {
          message: [Message('user').createFailureErrorMessage],
          error: 'Bad Request',
        },
      };
    }

    const existingUser = await this.findByEmail(
      this.stringService.stringToLowerCase(email),
    );
    if (existingUser) {
      this.loggerService.warn(
        `UserService > create(): User with email ${email} already exists`,
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {
          message: [[`User ${email} already exists`]],
          error: 'Bad Request',
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    this.loggerService.log(
      `UserService > create(): Password hashed for email: ${email}`,
    );

    const userData: UserInterface = {
      email: this.stringService.stringToLowerCase(email),
      password: hashedPassword,
      name,
      role,
    };

    try {
      const newUser = await this.usersRepository.create(userData);
      const { password, ...responseUserData } = newUser;
      this.loggerService.log(
        `UsersService > create(): User created with ID ${newUser.id}`,
      );
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          user: responseUserData,
        },
      };
    } catch (error) {
      this.loggerService.error(
        `UsersService > create(): Failed to create user for email: ${email}`,
        error,
      );
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [Message('user').createFailureErrorMessage],
        error: 'Bad Request',
      });
    }
  }

  // User service file code to fetch all users using the query params
  async findAll(query: MetaDataDto): Promise<UserAllResDto> {
    this.loggerService.log(`User > getAll(): called`);
    try {
      let { queryBuilder, paginationQuery } = this.metaDataService.generateMetaDataForQueryBuilder(
        query,
        ModuleNames.USERS,
      )
      const userRecords = await this.usersRepository.getAll(queryBuilder);
      console.log("User records obtained: ", userRecords);
      const users = userRecords.map((user) => new UserResDto(user));
      const { take, page } = paginationQuery;
      const totalRecords = await this.usersRepository.count();
      let totalRecordsWithFilter = totalRecords;
      if (queryBuilder?.where) {
        totalRecordsWithFilter = await this.usersRepository.countWithFilters(queryBuilder?.where);
      }
      const totalPages = await this.usersRepository.getTotalPagesCount(totalRecordsWithFilter, take);

      const metaData: ReturnMetaData = {
        countPerPage: take,
        page,
        totalRecords,
        totalRecordsWithFilter,
        totalPages,
        filters: query.filter,
        // Only returns the order object if query.order is present
        ...(query?.order && {
          orderBy: {
            [query.order.field]: query.order.value
          }
        })
      }

      this.loggerService.log(`Users > findAll(): success`);
      return { metaData, data: users };
    } catch (error) {
      this.loggerService.error(`User > findAll(): ${error}`);
      throw new BadRequestException([Message().defaultApiMessage]);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.loggerService.log(`User >  update(): called`);
    const userToEdit = this.usersRepository.findUserById(id);
    if (!userToEdit) {
      this.loggerService.warn(`User > updateUser with ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `User with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }
    let result: User;
    try {
      const updatedUserData: UserInterface = {
        email: updateUserDto?.email,
        name: updateUserDto?.name,
      }
      result = await this.usersRepository.update(id, updatedUserData);
      this.loggerService.log(`User > update(): success`);
    } catch (error) {
      this.loggerService.error(`User > update(): error updateing contact, ${error}`);

      if (error.code === 'P2002') {
        this.loggerService.warn(`User > update(): email conflict error`);
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          data: {
            message: 'Email is already in use. Please use a different email.',
            error: 'Unique Constraint Violation',
          },
        })
      }
      throw new BadRequestException([Message().defaultApiMessage]);
    }
    return {
      statusCode: HttpStatus.OK,
      data: new UserResDto(result),
    }
  }

  async remove(id: number) {
    this.loggerService.log(`User > remove(): called`);
    const user: UserResDto = await this.findUserById(id);
    if (!user) {
      this.loggerService.warn(`User > removeUser with ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `User with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }

    try {
      await this.usersRepository.delete(id);
      this.loggerService.log(`User > remove(): success`);
      return {
        statusCode: HttpStatus.OK,
      }
    } catch (error) {
      this.loggerService.error(`User > remove(): error removeUser ${error}`);
      throw new BadRequestException([Message().defaultApiMessage]);
    }
  }
}