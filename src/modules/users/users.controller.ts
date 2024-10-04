import { Controller, Get, Body, Patch, Param, Delete, Res, UseGuards, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';
import { PolciesGuard } from '../guards/policies-guard/policies.guard';
import { CheckPermissions } from '../casl/check-policies.decorator';
import { Action } from '../casl/enums/actions.enum';
import { Subject } from '../casl/enums/subjects.enum';
import { MetaDataDto, UserParamDto } from './dto/dto';
import { UserAllResDto, UserResDto } from './dto/user-response.dto';
import { query, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
  ) { }

  // The @UseGuards with the AccessTokenAuthGuard & PolciesGuard together along with the
  // @CheckPermissions custom decorator make this route protected from users allowing only the ADMIN complete access to this route and not the USERS
  @Get()
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.READ, Subject.USER])
  async findAll(
    @Query() query: MetaDataDto
  ): Promise<UserAllResDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.READ, Subject.USER])
  async findOne(@Param() params: UserParamDto) {
    const { id } = params;
    return this.usersService.findUserById(id);
  }

  @Put(':id')
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.UPDATE, Subject.USER])
  async update(
    @Param() params: UserParamDto,
    @Body() updateUserBody: UpdateUserDto,
    @Res() response: Response,
  ) {
    const { id } = params;
    const { statusCode, data } = await this.usersService.update(id, updateUserBody);
    return response.status(statusCode).send(data);
  }

  @Delete(':id')
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.DELETE, Subject.USER])
  async remove(
    @Param() params: UserParamDto,
  ) {
    const { id } = params;
    return this.usersService.remove(id);
  }
}
