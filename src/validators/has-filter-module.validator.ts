import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { MetaDataService } from "src/meta-data/meta-data.service";

@Injectable()
@ValidatorConstraint()
export class hasFilterModuleConstraint implements ValidatorConstraintInterface {
    constructor(private metaDataService: MetaDataService) { }
    async validate(inputDate: string, args: ValidationArguments) {
        try {
            const [moduleName] = args.constraints;
            console.log("Metadata service inside hasFilterModule: ", this.metaDataService)
            return this.metaDataService.setModule(moduleName);
        } catch (error) {
            return false;
        }
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return ':We cannot filter using those criteria';
    }
}
export function hasFilterModule(
    params?: any,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [params],
            validator: hasFilterModuleConstraint,
        });
    };
}
