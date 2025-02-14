import { Transform, Type } from "class-transformer";
import { IsArray, IsDefined, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { toNumber } from "src/helpers/cast.helper";
import { FilterDto } from "src/meta-data/dto/filter.dto";
import { OrderByDto } from "src/meta-data/dto/order.dto";

export class MetaDataDto {
    @IsOptional()
    @Transform(({ value }) => toNumber(value, { default: 25, min: 1 }))
    @IsNotEmpty()
    count?: number;

    @IsOptional()
    @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
    @IsNotEmpty()
    page?: number;

    @IsOptional()
    @ValidateNested({ each: true }) // Checks if the value is an array and if yes then validate each of the values inside the array
    @IsArray()
    @Type(() => FilterDto)
    // @hasFilterModule(ModuleNames.AUHTORS)
    filter?: [FilterDto]

    @ValidateNested()
    @IsDefined()
    @Type(() => OrderByDto)
    // @hasFilterModule(ModuleNames.USERS)
    @IsOptional()
    order?: OrderByDto;
}

// DTO for user params
export class UserParamDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}