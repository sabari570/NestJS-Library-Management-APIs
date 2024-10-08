import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class BookParamDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    authorId?: number;
}