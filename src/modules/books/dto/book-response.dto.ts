import { Author, Category, Loan } from "@prisma/client";
import ReturnMetaData from "src/meta-data/interfaces/return-meta-data.interface";


export class BookResDto {
    id: number;
    title: string;
    isbn?: string;
    published?: string;
    authors?: Author[];
    categories?: Category[];
    loans?: Loan[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.isbn = data.isbn;
        this.published = data.published;
        this.authors = data.authors;
        this.categories = data.categories;
        this.loans = data.loans;
    }
}

export class BookAllResDto {
    metaData?: ReturnMetaData;
    data?: BookResDto[];
}