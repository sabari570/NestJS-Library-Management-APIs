import { Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import AuthorInterface from "./interface/author.interface";

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
        return this.client.author.create({
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
                        autors: true,
                    }
                }
            }
        })
    }
}