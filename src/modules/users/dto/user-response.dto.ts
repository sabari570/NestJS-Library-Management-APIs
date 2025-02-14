import { Loan } from "@prisma/client";
import ReturnMetaData from "src/meta-data/interfaces/return-meta-data.interface";
import { Role } from "../enums/role-status.enum";

export class UserResDto {
    id: number;
    email: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    loans?: Loan[];
    role?: Role;

    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.loans = data.loans;
        this.role = data.role;
    }
}

export class UserAllResDto {
    metaData?: ReturnMetaData;
    data?: UserResDto[]
}