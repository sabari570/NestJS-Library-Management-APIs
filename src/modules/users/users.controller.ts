import { Controller, Get, Body, Patch, Param, Delete, Res, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';
import { PolciesGuard } from '../guards/policies-guard/policies.guard';
import { CheckPermissions } from '../casl/check-policies.decorator';
import { Action } from '../casl/enums/actions.enum';
import { Subject } from '../casl/enums/subjects.enum';
import { MetaDataDto } from './dto/dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
  ) { }

  // The @UseGuards with the AccessTokenAuthGuard & PolciesGuard together along with the
  // @CheckPermissions custom decorator make this route protected from users allowing only the ADMIN complete access to this route and not the USERS
  @Get()
  @UseGuards(AccessTokenAuthGuard, PolciesGuard)
  @CheckPermissions([Action.READ, Subject.USER])
  findAll(
    @Query() query: MetaDataDto
  ) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
