import { IsNotEmpty, IsString } from "class-validator";
import { OrderByValue } from "../enums/order-value.enum";

export class OrderByDto {
    @IsString()
    @IsNotEmpty()
    field: string;

    @IsNotEmpty()
    value: OrderByValue;
}