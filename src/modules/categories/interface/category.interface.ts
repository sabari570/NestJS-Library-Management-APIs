import { Book } from "@prisma/client";

export default interface CategoryInterface {
    id?: number;
    name?: string;
    books?: Book[];
    createdAt?: Date;
    updatedAt?: Date;
}