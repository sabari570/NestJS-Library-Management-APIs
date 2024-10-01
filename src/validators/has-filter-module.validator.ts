import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { MetaDataService } from "src/meta-data/meta-data.service";

@ValidatorConstraint({ async: true })
@Injectable()
export class hasFilterModuleConstraint implements ValidatorConstraintInterface {
    constructor(private metaDataService: MetaDataService) { }

    async validate(value: any, args?: ValidationArguments): Promise<boolean> {
        // It is from the args.constraints we actually get the module name that is passed from the DTO
        const [moduleName] = args.constraints;
        console.log("Metadata service: ", this.metaDataService)
        return this.metaDataService.setModule(moduleName);
    }
    defaultMessage() {
        return 'We cannot filter using those criteria';
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