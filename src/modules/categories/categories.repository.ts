import { Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import CategoryInterface from "./interface/category.interface";
import { Category } from "@prisma/client";

@Injectable({ scope: Scope.REQUEST })
export class CategoriesRepository {
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
        const record = await this.client.category.findFirst({ ...query });
        return !!record;
    }


    // Code for creating a category
    async create(category: CategoryInterface) {
        return this.client.category.create({
            data: {
                name: category.name
            }
        })
    }


    // Code to find an author through his name
    async findByCategoryName(name: string) {
        return await this.client.category.findUnique({
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
        return await this.client.category.findMany({
            ...queryBuilder,
            include: {
                books: {
                    select: {
                        id: true,
                        title: true,
                        isbn: true,
                        published: true,
                    }
                },
            }
        })
    }

    // code to count the total records
    async count(): Promise<number> {
        return await this.client.category.count();
    }

    // Code to count the total records after applying filter
    async countWithFilters(where): Promise<number> {
        const { _count } = await this.client.category.aggregate({
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
    async findCategoryById(id: number) {
        return await this.client.category.findUnique({
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
                    }
                },
            },
        });
    }

    // Code to update the author details
    async update(id: number, category: CategoryInterface) {
        return this.client.category.update({
            where: {
                id
            },
            data: {
                name: category.name,
            }
        });
    }

    // Code to delete the author details
    async delete(id: number) {
        return this.client.category.delete({
            where: {
                id
            }
        })
    }

    // Code to find if author id is present or not
    async validateCategories(categoryIds: number[]): Promise<Category[]> {
        return await this.client.category.findMany({
            where: {
                id: {
                    in: categoryIds
                }
            }
        });
    }
}