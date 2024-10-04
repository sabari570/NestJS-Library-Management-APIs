import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';
import { PolciesGuard } from '../guards/policies-guard/policies.guard';
import { CheckPermissions } from '../casl/check-policies.decorator';
import { Action } from '../casl/enums/actions.enum';
import { Subject } from '../casl/enums/subjects.enum';

@Controller('books')
export class BooksController {
    constructor(private readonly bookService: BooksService) { }

    @Get()
    @UseGuards(AccessTokenAuthGuard, PolciesGuard)
    @CheckPermissions([Action.READ, Subject.BOOK])
    async findAllBooks() { }

    @Post()
    @UseGuards(AccessTokenAuthGuard, PolciesGuard)
    @CheckPermissions([Action.CREATE, Subject.BOOK])
    async createBook() { }

    @Get(':id')
    @UseGuards(AccessTokenAuthGuard, PolciesGuard)
    @CheckPermissions([Action.READ, Subject.BOOK])
    async findBookById() { }

    @Put(':id')
    @UseGuards(AccessTokenAuthGuard, PolciesGuard)
    @CheckPermissions([Action.UPDATE, Subject.BOOK])
    async updateBook() { }

    @Delete(':id')
    @UseGuards(AccessTokenAuthGuard, PolciesGuard)
    @CheckPermissions([Action.DELETE, Subject.BOOK])
    async deleteBook() { }

}
