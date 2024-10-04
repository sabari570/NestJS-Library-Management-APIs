import { Book } from "@prisma/client";

export default interface AuthorInterface {
    id?: number;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    books?: Book[];
}