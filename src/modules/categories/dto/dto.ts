import { IsNotEmpty, IsNumber } from "class-validator";

// DTO for category params
export class CategoryParamDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}