import { Injectable } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: true })
@Injectable()
export class IsRecordExistConstraint implements ValidatorConstraintInterface {
    private moduleService;

    // Inject ModuleRef to dynamically resolve services
    constructor(private moduleRef: ModuleRef) { }

    async validate(columnNameValue: string, args: ValidationArguments): Promise<boolean> {
        const { service, fieldName, reverse } = args.constraints[0];

        const accountId = args.object['accountId'];

        const request = {
            headers: {
                accountId,
            }
        }

        const contextId = ContextIdFactory.create();
        this.moduleRef.registerRequestByContextId(request, contextId);

        // Resolve the service instance dynamically using the context ID
        this.moduleService = await this.moduleRef.resolve(service, contextId, { strict: false })

        const recordExist = await this.moduleService.recordExist(
            columnNameValue, // Value of the column being checked
            fieldName,       // The field name in the database to check against
            accountId,       // The account ID for context-specific checks (optional)
        );
        if (reverse) return !recordExist;
        return recordExist;
    }
}

export function IsRecordExist(
    params: any,
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [params],
            validator: IsRecordExistConstraint,
        })
    }
}