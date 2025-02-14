import { Book } from "@prisma/client";
import ReturnMetaData from "src/meta-data/interfaces/return-meta-data.interface";

export class AuthorResDto {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    books?: Book[];

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.books = data.books;
    }
}

export class AuthorAllResDto {
    metaData?: ReturnMetaData;
    data?: AuthorResDto[];
}