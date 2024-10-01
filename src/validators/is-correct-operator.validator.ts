import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { MetaDataService } from "src/meta-data/meta-data.service";

@ValidatorConstraint()
@Injectable()
export class IsCorrectOperatorConstraint implements ValidatorConstraintInterface {
    constructor(private metaDataService: MetaDataService) { }

    validate(value: string, args?: ValidationArguments): Promise<boolean> | boolean {
        try {
            return this.metaDataService.validateOperators(
                value,
                // this field and value from the args.object we get it from the query params
                // the query params get converted to the DTO object and thus we extract the data from there
                args.object['value'],
                args.object['field']
            )
        } catch (error) {
            return false;
        }
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return ": We cannot filter using those criteria"
    }
}

export function IsCorrectOperator(
    params?: any,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [params],
            validator: IsCorrectOperatorConstraint,
        });
    };
}
