import { Injectable } from "@nestjs/common";
import { EnumService, EnumValueType } from "src/helpers/enum.service";
import { FieldType } from "../enums/field-type.enum";
import { StringOperators } from "../enums/operators/string-operators.enum";
import { ArrayOperators } from "../enums/operators/array-operators.enum";
import { NumberOperators } from "../enums/operators/number-operators.enum";
import { DateOperators } from "../enums/operators/date-operators.enum";
import { DateRangeOperators } from "../enums/operators/date-range-operators.enum";
import { NowDateRangeOperators } from "../enums/operators/now-date-range.enum";

@Injectable()
export class FilterOperatorFactory {
    constructor(private readonly enumService: EnumService) { }

    getOperators(fieldType: FieldType): EnumValueType[] {
        switch (fieldType) {
            case FieldType.STRING:
                return [
                    ...this.enumService.getValues(StringOperators),
                    ...this.enumService.getValues(ArrayOperators),
                ]
            case FieldType.NUMBER:
            case FieldType.INTEGER:
            case FieldType.DECIMAL:
                return [
                    ...this.enumService.getValues(NumberOperators),
                    ...this.enumService.getValues(ArrayOperators)
                ]
            case FieldType.DATE:
            case FieldType.DATETIME:
                return this.enumService.getValues(DateOperators);
            case FieldType.DATE_RANGE:
                return this.enumService.getValues(DateRangeOperators);
            case FieldType.NOW_DATE_RANGE:
                return this.enumService.getValues(NowDateRangeOperators);
            default: break;
        }
    }

}