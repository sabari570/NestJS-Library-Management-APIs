import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, Scope } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorsRepository } from './authors.repository';
import { Message } from 'src/constants/message.constants';
import { StringService } from 'src/helpers/string.service';
import AuthorInterface from './interface/author.interface';
import { MetaDataDto } from '../users/dto/dto';
import { MetaDataService } from 'src/meta-data/meta-data.service';
import { ModuleNames } from 'src/meta-data/enums/modules.enum';
import { AuthorAllResDto, AuthorResDto } from './dto/authors-response.dto';
import ReturnMetaData from 'src/meta-data/interfaces/return-meta-data.interface';
import { Author } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class AuthorsService {
  constructor(
    private readonly authorsRespository: AuthorsRepository,
    private readonly loggerService: Logger,
    private readonly stringService: StringService,
    private readonly metaDataService: MetaDataService,
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
        `AuthorService > create(): No body is passed for cretaing an author`,
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

  async findAll(query: MetaDataDto): Promise<AuthorAllResDto> {
    this.loggerService.log(`AuthorsService > findAll(): called`);
    try {
      const { queryBuilder, paginationQuery } = this.metaDataService.generateMetaDataForQueryBuilder(query, ModuleNames.AUHTORS);
      const authorRecords = await this.authorsRespository.getAll(queryBuilder);
      const authors: AuthorResDto[] = authorRecords.map((author) => new AuthorResDto(author));
      const { take, page } = paginationQuery;

      const totalRecords = await this.authorsRespository.count();
      let totalRecordsWithFilter = totalRecords;
      if (queryBuilder?.where) {
        totalRecordsWithFilter = await this.authorsRespository.countWithFilters(queryBuilder?.where);
      }

      const totalPages = await this.authorsRespository.getTotalPagesCount(totalRecordsWithFilter, take);

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

      this.loggerService.log(`Authors > findAll(): success`);
      return { metaData, data: authors };
    } catch (error) {
      this.loggerService.error(`Authors > findAll(): ${error}`);
      throw new BadRequestException([Message().defaultApiMessage]);
    }
  }

  async findAuthorById(id: number): Promise<AuthorResDto> {
    this.loggerService.log(`AuthorsService > findAuthorById(): called for id: ${id}`);
    const authorRecord = await this.authorsRespository.findAuthorById(id);
    if (!authorRecord) {
      this.loggerService.warn(`Auhtor > findAuthorById ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `Author with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }
    this.loggerService.log(`Author >  findCategoryById(): success`);
    return new AuthorResDto(authorRecord);
  }


  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    this.loggerService.log(`Author >  update(): called`);
    const authorToEdit = await this.authorsRespository.findAuthorById(id);
    if (!authorToEdit) {
      this.loggerService.warn(`Author > updateAuthor with ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `Author with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }
    let result: Author;
    try {
      const updatedAuthorData: AuthorInterface = {
        name: updateAuthorDto?.name,
      }
      result = await this.authorsRespository.update(id, updatedAuthorData);
      this.loggerService.log(`Author > update(): success`);
    } catch (error) {
      this.loggerService.error(`Author > update(): error updateing Author, ${error}`);

      if (error.code === 'P2002') {
        this.loggerService.warn(`Author > update(): name conflict error`);
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          data: {
            message: 'Name is already in use. Please use a different name.',
            error: 'Unique Constraint Violation',
          },
        })
      }
      throw new BadRequestException([Message().defaultApiMessage]);
    }
    return {
      statusCode: HttpStatus.OK,
      data: new AuthorResDto(result),
    }
  }

  async remove(id: number) {
    this.loggerService.log(`Author > remove(): called`);
    const author: AuthorResDto = await this.findAuthorById(id);
    if (!author) {
      this.loggerService.warn(`Author > removeAuthor with ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `Author with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }

    try {
      await this.authorsRespository.delete(id);
      this.loggerService.log(`Author > remove(): success`);
      return {
        statusCode: HttpStatus.OK,
      }
    } catch (error) {
      this.loggerService.error(`Author > remove(): error removeAuthor ${error}`);
      throw new BadRequestException([Message().defaultApiMessage]);
    }
  }

  async validateAuthors(authorIds: number[]): Promise<number[]> {
    const authors = await this.authorsRespository.validateAuthors(authorIds);
    const validAuthorIds = authors.map((author) => author.id);
    return authorIds.filter((id) => !validAuthorIds.includes(id));
  }
}
