import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Res, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';
import { PolciesGuard } from '../guards/policies-guard/policies.guard';
import { CheckPermissions } from '../casl/check-policies.decorator';
import { Action } from '../casl/enums/actions.enum';
import { Subject } from '../casl/enums/subjects.enum';
import { Response } from 'express';
import { MetaDataDto } from '../users/dto/dto';
import { AuthorAllResDto } from './dto/authors-response.dto';
import { AuthorParamDto } from './dto/dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) { }

  @Post()
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.CREATE, Subject.BOOK])
  async create(@Body() createAuthorDto: CreateAuthorDto, @Res() response: Response) {
    const { statusCode, data } = await this.authorsService.create(createAuthorDto);
    return response.status(statusCode).send(data)
  }

  @Get()
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.READ, Subject.BOOK])
  async findAll(
    @Query() query: MetaDataDto
  ): Promise<AuthorAllResDto> {
    return this.authorsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.READ, Subject.BOOK])
  async findOne(@Param() params: AuthorParamDto) {
    const { id } = params;
    return this.authorsService.findAuthorById(id);
  }

  @Put(':id')
  @CheckPermissions([Action.UPDATE, Subject.USER])
  async update(
    @Param() params: AuthorParamDto,
    @Body() updateAuthorBody: UpdateAuthorDto,
    @Res() response: Response,
  ) {
    const { id } = params;
    const { statusCode, data } = await this.authorsService.update(id, updateAuthorBody);
    return response.status(statusCode).send(data);
  }

  @Delete(':id')
  @UseGuards(AccessTokenAuthGuard)
  @CheckPermissions([Action.DELETE, Subject.USER])
  async remove(
    @Param() params: AuthorParamDto,
  ) {
    const { id } = params;
    return this.authorsService.remove(id);
  }
}
