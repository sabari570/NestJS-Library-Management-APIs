import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { StringService } from '../../helpers/string.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService, 
    UsersRepository, 
    Logger, 
    StringService, 
    JwtService,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule { }
