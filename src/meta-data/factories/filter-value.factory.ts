import { Injectable } from "@nestjs/common";
import { Operators } from "../enums/operators/operators.enum";
import { DateTime } from 'luxon';
import { dateFormat, dateTimeFormat } from "src/constants/format.constants";
import { FieldType } from "../enums/field-type.enum";
import ValueInterface from "../interfaces/value.interface";

@Injectable()
export class FilterValueFactory {
    validateValue(field: ValueInterface, operator = ''): boolean {
        switch (field.type) {
            case FieldType.STRING:
                return this.validateString(field, operator);
            case FieldType.NUMBER:
            case FieldType.INTEGER:
                return this.validateNumber(field)
            case FieldType.DECIMAL:
                return this.validateDecimal(field);
            case FieldType.DATE:
            case FieldType.DATETIME:
                return this.validateDate(field);
            case FieldType.DATE_RANGE:
                return this.validateDateRange(field);
            case FieldType.NOW_DATE_RANGE:
                return this.validateDateNowRange(field);
            default: break;
        }
    }

    private validateString(field: ValueInterface, operator): boolean {
        return (
            [Operators.IS_BLANK, Operators.NOT_BLANK].includes(operator) ||
            typeof field.value === 'string' ||
            field.value instanceof String
        )
    }

    private validateNumber(field): boolean {
        let isValid = true;
        const number = Number(field.valid);
        isValid = !isNaN(number) && Number.isInteger(number);
        return isValid;
    }

    private validateDecimal(field: ValueInterface): boolean {
        const number = Number(field.value);

        return !isNaN(number);
    }

    private validateDateNowRange(field: ValueInterface): boolean {
        let isValid = true;
        const number = Number(field.value);

        isValid =
            !isNaN(number) && Number.isInteger(number) && number < 1000 && number > 0;
        return isValid;
    }

    private validateDate(field: ValueInterface): boolean {
        try {
            return (
                DateTime.fromFormat(field.value, dateFormat).isValid ||
                DateTime.fromFormat(field.value, dateTimeFormat).isValid
            );
        } catch (error) {
            return false;
        }
    }

    private validateDateRange(field): boolean {
        const [fromDate, toDate] = field.value;

        if (!(fromDate && toDate)) return false;

        return (
            this.validateDate({ value: fromDate }) &&
            this.validateDate({ value: toDate })
        );
    }
}