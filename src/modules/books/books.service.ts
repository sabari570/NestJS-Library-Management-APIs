import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, Scope } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { MetaDataService } from 'src/meta-data/meta-data.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Message } from 'src/constants/message.constants';
import BookInterface from './interface/book.interface';
import { BookAllResDto, BookResDto } from './dto/book-response.dto';
import { MetaDataDto } from '../users/dto/dto';
import { ModuleNames } from 'src/meta-data/enums/modules.enum';
import ReturnMetaData from 'src/meta-data/interfaces/return-meta-data.interface';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '@prisma/client';
import { AuthorsService } from '../authors/authors.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable({ scope: Scope.REQUEST })
export class BooksService {
    constructor(
        private readonly booksRepository: BooksRepository,
        private readonly loggerService: Logger,
        private readonly metaDataService: MetaDataService,
        private readonly authorService: AuthorsService,
        private readonly categoryService: CategoriesService,
    ) { }

    async recordExist(id?, field?): Promise<Boolean> {
        return this.booksRepository.recordExist(id, field);
    }

    async findByBookTitle(title: string) {
        return await this.booksRepository.findByBookTitle(title);
    }

    async create(createBookDto: CreateBookDto) {
        const { title, isbn, published, authors, categories, loans } = createBookDto;
        this.loggerService.log(
            `BookService > create(): called for name: ${title}`,
        );
        if (!title || !isbn || !published) {
            this.loggerService.warn(
                `BookService > create(): No body is passed for cretaing a book`,
            );
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                data: {
                    message: [Message('book').createFailureErrorMessage],
                    error: 'Bad Request',
                },
            };
        }

        const existingBook = await this.findByBookTitle(title);
        if (existingBook) {
            this.loggerService.warn(
                `BookService > create(): Book with title ${title} already exists`
            );
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                data: {
                    message: [[`Book ${title} already exists`]],
                    error: 'Bad Request',
                },
            };
        }

        // Validating author ids passed
        if (authors) {
            const invalidAuthors = await this.authorService.validateAuthors(authors);
            if (invalidAuthors.length > 0) {
                this.loggerService.warn(
                    `BooksService > create(): Invalid author IDs: ${invalidAuthors.join(', ')}`
                );
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: [`Invalid author IDs: ${invalidAuthors.join(', ')}`],
                        error: 'Bad Request',
                    },
                });
            }
        }

        // Validating categories
        if (categories) {
            const invalidaCategories = await this.categoryService.validateCategories(categories);
            if (invalidaCategories.length > 0) {
                this.loggerService.warn(
                    `BooksService > create(): Invalid category IDs: ${invalidaCategories.join(', ')}`
                );
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: [`Invalid category IDs: ${invalidaCategories.join(', ')}`],
                        error: 'Bad Request',
                    },
                });
            }
        }

        const bookData: BookInterface = {
            title,
            isbn,
            published: new Date(published),
            authors: Array.isArray(authors) ? authors : [],
            categories: Array.isArray(categories) ? categories : [],
            loans: Array.isArray(loans) ? loans : []
        }

        try {
            const newBook = await this.booksRepository.create(bookData);
            this.loggerService.log(
                `BooksService > create(): Book created with ID ${newBook.id}`,
            );
            return {
                statusCode: HttpStatus.CREATED,
                data: {
                    book: newBook,
                },
            };
        } catch (error) {
            this.loggerService.error(
                `BooksService > create(): Failed to create category for name: ${title}`,
                error,
            );
            if (error.code === 'P2002') {
                this.loggerService.warn(`Book > create(): isbn conflict error`);
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: 'isbn already registered. Please use a different isbn.',
                        error: 'Unique Constraint Violation',
                    },
                })
            }
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: [Message('book').createFailureErrorMessage],
                error: 'Bad Request',
            });
        }
    }


    async findBookById(id: number): Promise<BookResDto> {
        this.loggerService.log(`BooksService > findBookById(): called for id: ${id}`);
        const bookRecord = await this.booksRepository.findBookById(id);
        if (!bookRecord) {
            this.loggerService.warn(`Book > findBookById ${id} not found`)
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                data: {
                    message: `Book with id ${id} not found`,
                    error: 'Bad Request',
                },
            })
        }
        this.loggerService.log(`Book >  findBookById(): success`);
        return new BookResDto(bookRecord);
    }


    async findAll(query: MetaDataDto): Promise<BookAllResDto> {
        this.loggerService.log(`BooksService > findAll(): called`);
        try {
            const { queryBuilder, paginationQuery } = this.metaDataService.generateMetaDataForQueryBuilder(query, ModuleNames.BOOKS);
            const bookRecords = await this.booksRepository.getAll(queryBuilder);
            const books: BookResDto[] = bookRecords.map((book) => new BookResDto(book));
            const { take, page } = paginationQuery;

            const totalRecords = await this.booksRepository.count();
            let totalRecordsWithFilter = totalRecords;
            if (queryBuilder?.where) {
                totalRecordsWithFilter = await this.booksRepository.countWithFilters(queryBuilder?.where);
            }

            const totalPages = await this.booksRepository.getTotalPagesCount(totalRecordsWithFilter, take);

            const metaData: ReturnMetaData = {
                countPerPage: take,
                page,
                totalRecords,
                totalRecordsWithFilter,
                totalPages,
                filters: query.filter,
                // Only returns the order object if query.order is present
                ...(query?.order && {
                    orderBy: {
                        [query.order.field]: query.order.value
                    }
                })
            }

            this.loggerService.log(`Books > findAll(): success`);
            return { metaData, data: books };
        } catch (error) {
            this.loggerService.error(`Books > findAll(): ${error}`);
            throw new BadRequestException([Message().defaultApiMessage]);
        }
    }

    async update(id: number, updateBookDto: UpdateBookDto) {
        this.loggerService.log(`Book >  update(): called`);
        const bookToEdit = await this.booksRepository.findBookById(id);
        if (!bookToEdit) {
            this.loggerService.warn(`Book > updateBook with ${id} not found`)
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                data: {
                    message: `Book with id ${id} not found`,
                    error: 'Bad Request',
                },
            })
        }

        // Validating author ids passed
        if (updateBookDto?.authors) {
            const invalidAuthors = await this.authorService.validateAuthors(updateBookDto.authors);
            if (invalidAuthors.length > 0) {
                this.loggerService.warn(
                    `BooksService > update(): Invalid author IDs: ${invalidAuthors.join(', ')}`
                );
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: [`Invalid author IDs: ${invalidAuthors.join(', ')}`],
                        error: 'Bad Request',
                    },
                });
            }
        }

        // Validating categories
        if (updateBookDto?.categories) {
            const invalidaCategories = await this.categoryService.validateCategories(updateBookDto.categories);
            if (invalidaCategories.length > 0) {
                this.loggerService.warn(
                    `BooksService > update(): Invalid category IDs: ${invalidaCategories.join(', ')}`
                );
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: [`Invalid category IDs: ${invalidaCategories.join(', ')}`],
                        error: 'Bad Request',
                    },
                });
            }
        }

        let result: Book;
        try {
            const updatedBookData: BookInterface = {
                title: updateBookDto.title,
                isbn: updateBookDto.isbn,
                published: updateBookDto.published,
                authors: Array.isArray(updateBookDto.authors) ? updateBookDto.authors : [],
                categories: Array.isArray(updateBookDto.categories) ? updateBookDto.categories : [],
                loans: Array.isArray(updateBookDto.loans) ? updateBookDto.loans : [],
            }
            result = await this.booksRepository.update(id, updatedBookData);
            this.loggerService.log(`Category > update(): success`);
        } catch (error) {
            this.loggerService.error(`Category > update(): error updateing category, ${error}`);

            if (error.code === 'P2002') {
                this.loggerService.warn(`category > update(): name conflict error`);
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: 'Name is already in use. Please use a different name.',
                        error: 'Unique Constraint Violation',
                    },
                })
            }
            throw new BadRequestException([Message().defaultApiMessage]);
        }
        return {
            statusCode: HttpStatus.OK,
            data: new BookResDto(result),
        }
    }


    async remove(id: number) {
        this.loggerService.log(`Book > remove(): called`);
        const book: BookResDto = await this.findBookById(id);
        if (!book) {
            this.loggerService.warn(`Book > removeBook with ${id} not found`)
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                data: {
                    message: `Book with id ${id} not found`,
                    error: 'Bad Request',
                },
            })
        }

        try {
            await this.booksRepository.delete(id);
            this.loggerService.log(`Book > remove(): success`);
            return {
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            this.loggerService.error(`Book > remove(): error removeBook ${error}`);
            throw new BadRequestException([Message().defaultApiMessage]);
        }
    }

    async removeAuthorIdsFromBook(id: number, authorIdToRemove) {
        this.loggerService.log(`BooksService > removeDependenciesOfBook(): called for bookId ${id}, removing authorId ${authorIdToRemove}`);
        const bookToEdit = await this.booksRepository.findBookById(id);
        if (!bookToEdit) {
            this.loggerService.warn(`Book > updateBook with ${id} not found`)
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                data: {
                    message: `Book with id ${id} not found`,
                    error: 'Bad Request',
                },
            })
        }

        // Validating author ids passed
        if (authorIdToRemove) {
            const invalidAuthors = await this.authorService.validateAuthors([authorIdToRemove]);
            if (invalidAuthors.length > 0) {
                this.loggerService.warn(
                    `BooksService > update(): Invalid author IDs: ${invalidAuthors.join(', ')}`
                );
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: {
                        message: [`Invalid author IDs: ${invalidAuthors.join(', ')}`],
                        error: 'Bad Request',
                    },
                });
            }
        }

        try {
            const updatedAuthors = bookToEdit.authors.filter((author) => author.id !== authorIdToRemove);
            const updateAuthorIdsQuery = {
                authors: {
                    set: updatedAuthors.map((author) => ({ id: author.id }))
                }
            }
            const updatedBook = await this.booksRepository.removeDependenciesOfBook(id, updateAuthorIdsQuery);
            this.loggerService.log(
                `BooksService > updateAuthors(): Author ID ${authorIdToRemove} removed from book ID ${id}`
            );

            return {
                statusCode: HttpStatus.OK,
                data: {
                    book: updatedBook,
                },
            };
        } catch (error) {
            this.loggerService.error(`Book > updateAuthorIds(): error ${error}`);
            throw new BadRequestException([Message().defaultApiMessage]);
        }
    }
}
