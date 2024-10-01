import ReturnMetaData from "src/meta-data/interfaces/return-meta-data.interface";

export class UserResDto {
    id: number;
    email: string;
    name?: string;
    createdAt?: Date;

    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.createdAt = data.createdAt;
    }
}

export class UserAllResDto {
    metaData?: ReturnMetaData;
    data?: UserResDto[]
}