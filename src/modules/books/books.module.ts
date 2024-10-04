import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MetaDataModule } from 'src/meta-data/meta-data.module';
import { BooksRepository } from './books.repository';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MetaDataModule,
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository, JwtService]
})
export class BooksModule { }
