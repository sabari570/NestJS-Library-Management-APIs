import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { MetaDataService } from "src/meta-data/meta-data.service";

@ValidatorConstraint()
@Injectable()
export class IsFiltetFieldConstraint implements ValidatorConstraintInterface {
    constructor(private metaDataService: MetaDataService) { }
    async validate(inputDate: string) {
        const fields = this.metaDataService.getFields();

        return fields?.some((field) => field === inputDate);
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return ': We cannot filter using those criteria'
    }
}

export function IsFilterField(
    params?: any,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [params],
            validator: IsFiltetFieldConstraint,
        })
    }
}