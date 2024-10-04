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
  findAll(
    @Query() query: MetaDataDto
  ) {
    return this.authorsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.CREATE, Subject.BOOK])
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.CREATE, Subject.BOOK])
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(+id, updateAuthorDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.CREATE, Subject.BOOK])
  remove(@Param('id') id: string) {
    return this.authorsService.remove(+id);
  }
}
