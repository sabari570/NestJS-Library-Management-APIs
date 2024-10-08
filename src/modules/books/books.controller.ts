import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';
import { PolciesGuard } from '../guards/policies-guard/policies.guard';
import { CheckPermissions } from '../casl/check-policies.decorator';
import { Action } from '../casl/enums/actions.enum';
import { Subject } from '../casl/enums/subjects.enum';
import { CreateBookDto } from './dto/create-book.dto';
import { Response } from 'express';
import { BookParamDto } from './dto/dto';
import { MetaDataDto } from '../users/dto/dto';
import { BookAllResDto } from './dto/book-response.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
    constructor(private readonly bookService: BooksService) { }

    @Get()
    @UseGuards(AccessTokenAuthGuard)
    @CheckPermissions([Action.READ, Subject.BOOK])
    async findAll(
        @Query() query: MetaDataDto
    ): Promise<BookAllResDto> {
        return this.bookService.findAll(query);
    }

    @Post()
    @UseGuards(AccessTokenAuthGuard)
    @CheckPermissions([Action.CREATE, Subject.BOOK])
    async create(@Body() createBookDto: CreateBookDto, @Res() response: Response) {
        const { statusCode, data } = await this.bookService.create(createBookDto);
        return response.status(statusCode).send(data)
    }

    @Get(':id')
    @UseGuards(AccessTokenAuthGuard)
    @CheckPermissions([Action.READ, Subject.BOOK])
    async findOne(@Param() params: BookParamDto) {
        const { id } = params;
        return this.bookService.findBookById(id);
    }


    @Put(':id')
    @CheckPermissions([Action.UPDATE, Subject.USER])
    async update(
        @Param() params: BookParamDto,
        @Body() updateBookBody: UpdateBookDto,
        @Res() response: Response,
    ) {
        const { id } = params;
        const { statusCode, data } = await this.bookService.update(id, updateBookBody);
        return response.status(statusCode).send(data);
    }

    @Delete(':id')
    @UseGuards(AccessTokenAuthGuard)
    @CheckPermissions([Action.DELETE, Subject.USER])
    async remove(
        @Param() params: BookParamDto,
    ) {
        const { id } = params;
        return this.bookService.remove(id);
    }

    @Delete(':id/authors/:authorId')
    @UseGuards(AccessTokenAuthGuard)
    @CheckPermissions([Action.READ, Subject.BOOK])
    async removeAuthorIdsFromBook(@Param() params: BookParamDto) {
        const { id, authorId } = params;
        return this.bookService.removeAuthorIdsFromBook(id, authorId);
    }

}
