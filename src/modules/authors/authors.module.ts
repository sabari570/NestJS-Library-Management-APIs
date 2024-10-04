import { Logger, Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { AuthorsRepository } from './authors.repository';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { StringService } from 'src/helpers/string.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthorsController],
  providers: [
    AuthorsService,
    AuthorsRepository,
    Logger,
    JwtService,
    StringService,
  ],
})
export class AuthorsModule { }
