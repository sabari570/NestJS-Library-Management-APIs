import { Logger, Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MetaDataModule } from 'src/meta-data/meta-data.module';
import { BooksRepository } from './books.repository';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthorsService } from '../authors/authors.service';
import { AuthorsRepository } from '../authors/authors.repository';
import { StringService } from 'src/helpers/string.service';
import { CategoriesModule } from '../categories/categories.module';
import { CategoriesService } from '../categories/categories.service';
import { CategoriesRepository } from '../categories/categories.repository';

@Module({
  imports: [
    MetaDataModule,
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [
    BooksService,
    BooksRepository,
    JwtService,
    Logger,
    AuthorsService,
    AuthorsRepository,
    StringService,
    CategoriesService,
    CategoriesRepository
  ]
})
export class BooksModule { }
