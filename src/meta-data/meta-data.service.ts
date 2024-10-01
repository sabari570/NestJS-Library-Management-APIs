import { Injectable, Logger } from '@nestjs/common';
import { ModuleNames } from './enums/modules.enum';
import { FilterModuleFactory } from './factories/filter-module.factory';
import { FilterOperatorFactory } from './factories/filter-operator.factory';
import { FilterValueFactory } from './factories/filter-value.factory';
import { FilterQueryBuilderFactory } from './factories/filter-query-builder.factory';
import { EnumService } from 'src/helpers/enum.service';
import { StringService } from 'src/helpers/string.service';
import { FieldType } from './enums/field-type.enum';
import { ArrayType } from './enums/array-type.enum';
import { DateTime } from "luxon"
import ValueInterface from './interfaces/value.interface';
import ModuleInterface from './interfaces/filter.interface';

@Injectable()
export class MetaDataService {
    readonly defaultCount = 25;
    readonly defaultPage = 1;

    // This is the filtersObject type it contains a list of filter objects
    filtersObject: ModuleInterface[];
    moduleName: ModuleNames;

    constructor(
        // This ModuleFactory is the one responsible for returning a list of possible filter objects for our module which we give
        private readonly filterModuleFactory: FilterModuleFactory,

        // This OperatorFactory actually returns the operators needed based on the filedType we give from the filterObject
        // For Eg: if the filedType is string it returns the string operators like 'equals' | 'not_equals, etc
        private readonly filterOperatorFactory: FilterOperatorFactory,

        // This is used to properly validate the value that is given for filtering such as,
        // If the value is of type string it checks whether it is actually a string or number if number then it returns false and fails to validate
        private readonly filterValueFactory: FilterValueFactory,

        // This is actually used to generate query from the filter object we have passed inorder to fetch the records from the DB
        private readonly filterQueryBuilderFactory: FilterQueryBuilderFactory,

        // This is a service which is used to convert the enums to objects | values
        private readonly enumService: EnumService,
        private readonly loggerService: Logger,
        private readonly stringService: StringService,
    ) {
        console.log("MetaDataService instance created")
    }

    // this function is used to set the module which we are using and to set the filtersObject
    setModule(moduleName, filterObject?): boolean {
        console.log("Module name obtained: ", moduleName)
        this.filtersObject = this.filterModuleFactory.getFilterObject(moduleName);
        if (filterObject) this.filtersObject = filterObject;
        this.moduleName = moduleName;

        if (!this.filtersObject) return false;
        return true;
    }

    getFields(): string[] {
        return this.filtersObject?.map((object) => object.field);
    }

    // This function takes in the fieldOperator, fieldName and the fieldValue
    // and then returns a boolean value if the operators are valid
    validateOperators(fieldOperator, fieldName, fieldValue): boolean {
        const filterObject = this.getFilterObjectFromFieldName(fieldName);
        if (!filterObject) return false;

        const operators = this.filterOperatorFactory.getOperators(
            this.getFieldType(fieldValue, filterObject)
        )

        return operators.some((operator) => operator === fieldOperator);
    }

    // This function takes in fieldValue, fieldName and the fieldOperator and then checks if the value is correct or not
    // and then returns a boolean value
    validateValues(fieldValue, fieldOperator = '', filedName): boolean {
        const filterObject = this.getFilterObjectFromFieldName(filedName);
        if (!filterObject) return false;

        const value: ValueInterface = {
            value: fieldValue,
            type: this.getFieldType(fieldValue, filterObject),
            mainType: filterObject.type
        }
        return this.filterValueFactory.validateValue(value, fieldOperator);
    }

    // This function takes in the field name and returns that particular filter object
    getFilterObjectFromFieldName(fieldName: string): ModuleInterface {
        const [filterObject] = this.filtersObject.filter((object) => (
            object.field === fieldName
        ))
        return filterObject;
    }

    // This function takes in the fieldValue and then the filter object
    // It then checks what the field value type is and then returns its Field type
    getFieldType(fieldValue, field: ModuleInterface): FieldType {
        // First it checks whether the field value belongs to the array type
        const isArrayType = !!this.enumService.getKeyFromValue(ArrayType, field.type);

        // If yes then and the field contains a list and if the date inside the list is valid then it returns a FieldType.DATE_RANGE
        if (Array.isArray(fieldValue) && fieldValue.length > 1 && this.isDateRange(fieldValue)) {
            FieldType.DATE_RANGE;
        }

        // If the fieldValue is a DATE and on proper conversion to number it gives an integer then we return a NOW_DATE_RANGE type
        if (
            (field.type === FieldType.DATE || field.type === FieldType.DATETIME) &&
            (Number.isInteger(Number(fieldValue)))
        ) {
            return FieldType.NOW_DATE_RANGE;
        }
        return field.type;
    }

    // This function takes in a date range list and checks whether it is valid or not
    isDateRange(fieldValue): boolean {
        if (Array.isArray(fieldValue) && fieldValue.length) {
            const [before, after] = fieldValue;

            return (
                (DateTime.fromSQL(before).isValid || DateTime.fromISO(before).isValid) &&
                (DateTime.fromSQL(after).isValid || DateTime.fromISO(after).isValid)
            )
        }
        return false;
    }
}
