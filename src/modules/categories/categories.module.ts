import { Logger, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoriesRepository,
    Logger,
    JwtService
  ],
})
export class CategoriesModule { }
