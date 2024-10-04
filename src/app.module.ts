import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './modules/casl/casl.module';
import { MetaDataModule } from './meta-data/meta-data.module';
import { ValidatorModule } from './validators/validator.module';
import { BooksModule } from './modules/books/books.module';
import { AuthorsModule } from './modules/authors/authors.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    CaslModule,
    MetaDataModule,
    ValidatorModule,
    BooksModule,
    AuthorsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
