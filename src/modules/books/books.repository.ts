import { Injectable, Scope } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable({ scope: Scope.REQUEST })
export class BooksRepository {
    constructor(private readonly client: PrismaService) { }
}