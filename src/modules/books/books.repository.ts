import { Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import BookInterface from "./interface/book.interface";

@Injectable({ scope: Scope.REQUEST })
export class BooksRepository {
    constructor(private readonly client: PrismaService) { }

    // Code to check whether the record exists or not
    async recordExist(id?, field = 'id'): Promise<boolean> {
        let query = {};
        if (id) {
            query = {
                where: {
                    [field]: id
                }
            }
        }
        const record = await this.client.book.findFirst({ ...query });
        return !!record;
    }


    // Code for creating a book
    async create(book: BookInterface) {
        return this.client.book.create({
            data: {
                title: book.title,
                isbn: book.isbn,
                published: book.published,
                authors: {
                    // The connect operation is used to link existing records in the database 
                    // to the new record you are creating. Instead of creating new records for authors, 
                    // you're telling Prisma to associate the book with authors that already exist in the database
                    connect: book.authors?.map((author) => ({ id: author })),
                },
                categories: {
                    connect: book.categories?.map((category) => ({ id: category })),
                },
                loans: {
                    connect: book.loans?.map((loan) => ({ id: loan }))
                }
            }
        })
    }


    // Code to find an author through his name
    async findByBookTitle(title: string) {
        return await this.client.book.findFirst({
            where: {
                title,
            },
            include: {
                authors: true,
                categories: true,
                loans: true,
            }
        })
    }

    // Code to fetch all the authors
    async getAll(queryBuilder) {
        return await this.client.book.findMany({
            ...queryBuilder,
            include: {
                authors: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                loans: true,
            }
        })
    }

    // code to count the total records
    async count(): Promise<number> {
        return await this.client.book.count();
    }

    // Code to count the total records after applying filter
    async countWithFilters(where): Promise<number> {
        const { _count } = await this.client.book.aggregate({
            // counts all the records, if where is provided then it counts all the records that satisfies this condition
            _count: true,
            where,
        });
        return Number(_count);
    }

    // Code to get the total pages count
    async getTotalPagesCount(count: number, take: number) {
        return Math.ceil(count / take);
    }

    // code to fetch author by id
    async findBookById(id: number) {
        return await this.client.book.findUnique({
            where: {
                id,
            },
            include: {
                authors: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                loans: true,
            },
        });
    }

    // Code to update the author details
    async update(id: number, book: BookInterface) {
        return this.client.book.update({
            where: {
                id
            },
            include: {
                authors: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            data: {
                title: book.title,
                isbn: book.isbn,
                published: book.published,
                authors: {
                    connect: book.authors?.map((author) => ({ id: author }))
                },
                categories: {
                    connect: book.categories?.map((category) => ({ id: category })),
                },
                loans: {
                    connect: book.loans?.map((loan) => ({ id: loan }))
                }
            }
        });
    }

    // Code to delete the author details
    async delete(id: number) {
        return this.client.book.delete({
            where: {
                id
            }
        })
    }

    // Code to remove the authors and categories from Book
    async removeDependenciesOfBook(id: number, conditionQuery) {
        return await this.client.book.update({
            where: {
                id,
            },
            data: { ...conditionQuery, },
            include: {
                authors: true,
                categories: true,
            }
        })
    }
}