import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';
import { Action } from '../casl/enums/actions.enum';
import { Subject } from '../casl/enums/subjects.enum';
import { CheckPermissions } from '../casl/check-policies.decorator';
import { Response } from 'express';
import { MetaDataDto } from '../users/dto/dto';
import { CategoryAllResDto } from './dto/categories-response.dto';
import { CategoryParamDto } from './dto/dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.CREATE, Subject.BOOK])
  async create(@Body() createCategoryDto: CreateCategoryDto, @Res() response: Response) {
    const { statusCode, data } = await this.categoriesService.create(createCategoryDto);
    return response.status(statusCode).send(data)
  }


  @Get()
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.READ, Subject.BOOK])
  async findAll(
    @Query() query: MetaDataDto
  ): Promise<CategoryAllResDto> {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.READ, Subject.BOOK])
  async findOne(@Param() params: CategoryParamDto) {
    const { id } = params;
    return this.categoriesService.findCategoryById(id);
  }

  @Put(':id')
  @CheckPermissions([Action.UPDATE, Subject.USER])
  async update(
    @Param() params: CategoryParamDto,
    @Body() updateCategoryBody: UpdateCategoryDto,
    @Res() response: Response,
  ) {
    const { id } = params;
    const { statusCode, data } = await this.categoriesService.update(id, updateCategoryBody);
    return response.status(statusCode).send(data);
  }

  @Delete(':id')
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.DELETE, Subject.USER])
  async remove(
    @Param() params: CategoryParamDto,
  ) {
    const { id } = params;
    return this.categoriesService.remove(id);
  }
}
