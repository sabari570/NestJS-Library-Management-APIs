import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { MetaDataService } from "src/meta-data/meta-data.service";

@ValidatorConstraint()
@Injectable()
export class IsCorrectValueConstraint implements ValidatorConstraintInterface {
    constructor(private metaDataService: MetaDataService) { }

    validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
        try {
            return this.metaDataService.validateValues(
                value,
                args.object['field'],
                args.object['operator']
            )
        } catch (error) {
            return false;
        }
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return ':We cannot filter using those criteria'
    }
}

export function IsCorrectValue(
    params?: any,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [params],
            validator: IsCorrectValueConstraint,
        });
    };
}