import { IsArray, IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateBookDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    isbn: string;

    @IsNotEmpty()
    @IsDate()
    published: Date;

    @IsArray()
    @IsInt({ each: true })
    authors: number[];

    @IsArray()
    @IsInt({ each: true })
    categories: number[];

    @IsArray()
    @IsInt({ each: true })
    loans: number[];
}