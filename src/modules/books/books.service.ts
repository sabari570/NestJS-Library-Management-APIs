import { Injectable, Scope } from '@nestjs/common';
import { BooksRepository } from './books.repository';

@Injectable({ scope: Scope.REQUEST })
export class BooksService {
    constructor(private readonly booksRepository: BooksRepository) { }

    async createBook() { }
}
