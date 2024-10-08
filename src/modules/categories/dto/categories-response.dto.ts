import { Book } from "@prisma/client";
import ReturnMetaData from "src/meta-data/interfaces/return-meta-data.interface";

export class CategoryResDto {
    id: number;
    name: string;
    books?: Book[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.books = data.books;
    }
}

export class CategoryAllResDto {
    metaData?: ReturnMetaData;
    data?: CategoryResDto[];
}