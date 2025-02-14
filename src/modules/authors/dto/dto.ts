import { IsNotEmpty, IsNumber } from "class-validator";

// DTO for author params
export class AuthorParamDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}