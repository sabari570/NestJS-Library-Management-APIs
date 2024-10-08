import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { MetaDataService } from 'src/meta-data/meta-data.service';
import { Message } from 'src/constants/message.constants';
import CategoryInterface from './interface/category.interface';
import { MetaDataDto } from '../users/dto/dto';
import { CategoryAllResDto, CategoryResDto } from './dto/categories-response.dto';
import { ModuleNames } from 'src/meta-data/enums/modules.enum';
import ReturnMetaData from 'src/meta-data/interfaces/return-meta-data.interface';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {

  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly loggerService: Logger,
    private readonly metaDataService: MetaDataService,
  ) { }


  async recordExist(id?, field?): Promise<Boolean> {
    return this.categoriesRepository.recordExist(id, field);
  }

  async findByCategoryName(name: string) {
    return await this.categoriesRepository.findByCategoryName(name);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    this.loggerService.log(
      `CategoryService > create(): called for name: ${name}`,
    );
    if (!name) {
      this.loggerService.warn(
        `CategoryService > create(): No body is passed for cretaing a category`,
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {
          message: [Message('author').createFailureErrorMessage],
          error: 'Bad Request',
        },
      };
    }

    const existingCategory = await this.findByCategoryName(name);
    if (existingCategory) {
      this.loggerService.warn(
        `CategoryService > create(): Category with name ${name} already exists`
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {
          message: [[`Category ${name} already exists`]],
          error: 'Bad Request',
        },
      };
    }

    const categoryData: CategoryInterface = {
      name,
    }

    try {
      const newCategory = await this.categoriesRepository.create(categoryData);
      this.loggerService.log(
        `CategoryService > create(): Category created with ID ${newCategory.id}`,
      );
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          category: newCategory,
        },
      };
    } catch (error) {
      this.loggerService.error(
        `CategoryService > create(): Failed to create category for name: ${name}`,
        error,
      );
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [Message('category').createFailureErrorMessage],
        error: 'Bad Request',
      });
    }
  }

  async findAll(query: MetaDataDto): Promise<CategoryAllResDto> {
    this.loggerService.log(`CategoriesService > findAll(): called`);
    try {
      const { queryBuilder, paginationQuery } = this.metaDataService.generateMetaDataForQueryBuilder(query, ModuleNames.CATEGORIES);
      const categoryRecords = await this.categoriesRepository.getAll(queryBuilder);
      const categories: CategoryResDto[] = categoryRecords.map((category) => new CategoryResDto(category));
      const { take, page } = paginationQuery;

      const totalRecords = await this.categoriesRepository.count();
      let totalRecordsWithFilter = totalRecords;
      if (queryBuilder?.where) {
        totalRecordsWithFilter = await this.categoriesRepository.countWithFilters(queryBuilder?.where);
      }

      const totalPages = await this.categoriesRepository.getTotalPagesCount(totalRecordsWithFilter, take);

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

      this.loggerService.log(`Categories > findAll(): success`);
      return { metaData, data: categories };
    } catch (error) {
      this.loggerService.error(`Categories > findAll(): ${error}`);
      throw new BadRequestException([Message().defaultApiMessage]);
    }
  }

  async findCategoryById(id: number): Promise<CategoryResDto> {
    this.loggerService.log(`CategoryService > findCategoryById(): called for id: ${id}`);
    const categoryRecord = await this.categoriesRepository.findCategoryById(id);
    if (!categoryRecord) {
      this.loggerService.warn(`Category > findCategoryById ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `Category with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }
    this.loggerService.log(`Category >  findCategoryById(): success`);
    return new CategoryResDto(categoryRecord);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    this.loggerService.log(`Catgeory >  update(): called`);
    const categoryToEdit = await this.categoriesRepository.findCategoryById(id);
    if (!categoryToEdit) {
      this.loggerService.warn(`Category > updateCategory with ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `Category with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }
    let result: Category;
    try {
      const updatedCategoryData: CategoryInterface = {
        name: updateCategoryDto?.name,
      }
      result = await this.categoriesRepository.update(id, updatedCategoryData);
      this.loggerService.log(`Category > update(): success`);
    } catch (error) {
      this.loggerService.error(`Category > update(): error updateing category, ${error}`);

      if (error.code === 'P2002') {
        this.loggerService.warn(`category > update(): name conflict error`);
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
      data: new CategoryResDto(result),
    }
  }

  async remove(id: number) {
    this.loggerService.log(`Category > remove(): called`);
    const category: CategoryResDto = await this.findCategoryById(id);
    if (!category) {
      this.loggerService.warn(`Category > removeCategory with ${id} not found`)
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        data: {
          message: `Category with id ${id} not found`,
          error: 'Bad Request',
        },
      })
    }

    try {
      await this.categoriesRepository.delete(id);
      this.loggerService.log(`Category > remove(): success`);
      return {
        statusCode: HttpStatus.OK,
      }
    } catch (error) {
      this.loggerService.error(`Category > remove(): error removeCategory ${error}`);
      throw new BadRequestException([Message().defaultApiMessage]);
    }
  }

  async validateCategories(categoryIds: number[]): Promise<number[]> {
    const categories = await this.categoriesRepository.validateCategories(categoryIds);
    const validCategoryId = categories.map((category) => category.id);
    return categoryIds.filter((id) => !validCategoryId.includes(id));
  }
}
