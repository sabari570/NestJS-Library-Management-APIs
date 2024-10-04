import { BadRequestException, HttpStatus, Injectable, Logger, Scope } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsRepository } from './authors.repository';
import { Message } from 'src/constants/message.constants';
import { StringService } from 'src/helpers/string.service';
import AuthorInterface from './interface/author.interface';
import { MetaDataDto } from '../users/dto/dto';

@Injectable({ scope: Scope.REQUEST })
export class AuthorsService {
  constructor(
    private readonly authorsRespository: AuthorsRepository,
    private readonly loggerService: Logger,
    private readonly stringService: StringService,
  ) { }


  async recordExist(id?, field?): Promise<Boolean> {
    return this.authorsRespository.recordExist(id, field);
  }

  async findByAuthorName(name: string) {
    return await this.authorsRespository.findByAuthorName(name);
  }

  async create(createAuthorDto: CreateAuthorDto) {
    const { name } = createAuthorDto;
    this.loggerService.log(
      `AuthorService > create(): called for name: ${name}`,
    );
    if (!name) {
      this.loggerService.warn(
        `UserService > create(): No body is passed for cretaing an user`,
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {
          message: [Message('author').createFailureErrorMessage],
          error: 'Bad Request',
        },
      };
    }

    const existingAuthor = await this.findByAuthorName(name);
    if (existingAuthor) {
      this.loggerService.warn(
        `AuthorsService > create(): Author with name ${name} already exists`
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {
          message: [[`Author ${name} already exists`]],
          error: 'Bad Request',
        },
      };
    }

    const authorData: AuthorInterface = {
      name,
    }

    try {
      const newAuthor = await this.authorsRespository.create(authorData);
      this.loggerService.log(
        `AuthorsService > create(): Author created with ID ${newAuthor.id}`,
      );
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          author: newAuthor,
        },
      };
    } catch (error) {
      this.loggerService.error(
        `AuthorService > create(): Failed to create author for name: ${name}`,
        error,
      );
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [Message('author').createFailureErrorMessage],
        error: 'Bad Request',
      });
    }
  }

  findAll(query: MetaDataDto) {
    this.loggerService.log(`AuthorsService > findAll(): called`);
  }

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return `This action updates a #${id} author`;
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
