import { Author, Category, Loan } from "@prisma/client";

export default interface BookInterface {
    id?: number;
    title?: string;
    isbn?: string;
    published?: Date;
    authors?: number[];
    categories?: number[];
    loans?: number[];
    createdAt?: Date;
    updatedAt?: Date;
}