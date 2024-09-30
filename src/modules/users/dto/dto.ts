import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";
import { toNumber } from "src/helpers/cast.helper";

export class MetaDataDto {
    @IsOptional()
    @Transform(({ value }) => toNumber(value, { default: 25, min: 1 }))
    @IsNotEmpty()
    count?: number;

    @IsOptional()
    @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
    @IsNotEmpty()
    page?: number;
}