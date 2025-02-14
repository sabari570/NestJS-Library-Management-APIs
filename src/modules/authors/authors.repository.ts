import { Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import AuthorInterface from "./interface/author.interface";
import { Author } from "@prisma/client";

@Injectable({ scope: Scope.REQUEST })
export class AuthorsRepository {
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
        const record = await this.client.author.findFirst({ ...query });
        return !!record;
    }


    // Code for creating an author
    async create(author: AuthorInterface) {
        return await this.client.author.create({
            data: {
                name: author.name
            }
        })
    }


    // Code to find an author through his name
    async findByAuthorName(name: string) {
        return await this.client.author.findUnique({
            where: {
                name,
            },
            include: {
                books: {
                    include: {
                        categories: true,
                        authors: true,
                    }
                }
            }
        })
    }

    // Code to fetch all the authors
    async getAll(queryBuilder) {
        return await this.client.author.findMany({
            ...queryBuilder,
            include: {
                // This is how we can select certain fields to be displayed which we feel necessary
                books:
                {
                    select: {
                        id: true,
                        title: true,
                        isbn: true,
                        published: true,
                        categories: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                },
            }
        })
    }

    // code to count the total records
    async count(): Promise<number> {
        return await this.client.author.count();
    }

    // Code to count the total records after applying filter
    async countWithFilters(where): Promise<number> {
        const { _count } = await this.client.user.aggregate({
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
    async findAuthorById(id: number) {
        return await this.client.author.findUnique({
            where: {
                id,
            },
            include: {
                books: {
                    select: {
                        id: true,
                        title: true,
                        isbn: true,
                        published: true,
                        categories: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
            },
        });
    }

    // Code to update the author details
    async update(id: number, author: AuthorInterface) {
        return await this.client.author.update({
            where: {
                id
            },
            data: {
                name: author.name,
            }
        });
    }

    // Code to delete the author details
    async delete(id: number) {
        return await this.client.author.delete({
            where: {
                id
            }
        })
    }

    // Code to find if author id is present or not
    async validateAuthors(authorIds: number[]): Promise<Author[]> {
        return await this.client.author.findMany({
            where: {
                id: {
                    in: authorIds
                }
            }
        });
    }
}