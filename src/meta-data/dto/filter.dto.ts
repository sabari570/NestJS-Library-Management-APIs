import { IsNotEmpty, IsString } from "class-validator";
import { IsFilterField } from "src/validators/is-filter-field.validator";
import { ModuleNames } from "../enums/modules.enum";
import { IsCorrectOperator } from "src/validators/is-correct-operator.validator";
import { Operators } from "../enums/operators/operators.enum";
import { IsCorrectValue } from "src/validators/is-correct-value.validator";

export class FilterDto {
    @IsString()
    @IsNotEmpty()
    @IsFilterField()
    field: string | ModuleNames;

    @IsString()
    @IsNotEmpty()
    @IsCorrectOperator()
    operator: Operators;

    @IsCorrectValue()
    value: any;
}