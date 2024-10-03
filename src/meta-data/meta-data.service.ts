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
import MetaDataInterface from './interfaces/meta-data.interface';
import Pagination from './interfaces/pagination.interface';
import { FilterDto } from './dto/filter.dto';
import QueryParamInterface from './interfaces/query-param.interface';
import { Operators } from './enums/operators/operators.enum';
import { OrderByDto } from './dto/order.dto';

@Injectable()
export class MetaDataService {
    readonly defaultCount = 10;
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

        // This is actually used to generate qmetaDataServiceuery from the filter object we have passed inorder to fetch the records from the DB
        private readonly filterQueryBuilderFactory: FilterQueryBuilderFactory,

        // This is a service which is used to convert the enums to objects | values
        private readonly enumService: EnumService,
        private readonly loggerService: Logger,
        private readonly stringService: StringService,
    ) { }

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

    // This function generates the meta data for filter as well as pagination query
    generateMetaDataForQueryBuilder(
        query: MetaDataInterface,
        moduleName = null
    ) {
        this.loggerService.log(`${moduleName} > generateMetaDataForQueryBuilder(): callled`);

        let success: boolean;
        // Set the filtersObject witht the module name provided
        if (!this.moduleName) {
            success = this.setModule(moduleName);
            if (!success) return;
        }

        if (query.filter) {
            // Checked whether the filter query contains the fields that is meant to be present for the given module
            const fields = this.getFields();
            success = fields?.some((field) => (
                query.filter?.some((filter) => filter.field === field)
            ));
            if (!success) throw new Error("Field name is invalid");

            // Validating the operators of the filters passed
            success = query.filter.every((filter) => (
                this.validateOperators(filter.operator, filter.field, filter.value)
            ))
            if (!success) throw new Error("Operator provided is invalid");

            // Validating the values of the filters passed
            success = query.filter.every((filter) => (
                this.validateValues(filter.value, filter.operator, filter.field)
            ))
            if (!success) throw new Error("Value is invalid");
        }
        // Creating a pagination object
        const paginationObject: Pagination = {
            count: query.count,
            page: query.page,
        }
        const paginationQuery = this.generatePaginationForQueryBuilder(paginationObject);
        const { take, skip } = paginationQuery;
        const filterQuery = this.generateFilterForQueryBuilder(query.filter);
        const sortQuery = this.generateSortForQueryBuilder(query.order);

        // Now we write the combined query object
        const queryBuilder = {
            take,
            skip,
            ...sortQuery,
            where: {
                // AND condtion is applied such that it applies all the filters and then return the results
                AND: [...filterQuery]
            }
        }

        const hasQueryFilter = (filterQuery) ?
            JSON.stringify(filterQuery) : 'No filter';

        this.loggerService.log(`${moduleName} > generateMetaDataForQueryBuilder(): Query filter - ${hasQueryFilter}`);
        this.loggerService.log(`${moduleName} > generateMetaDataForQueryBuilder(): success`);
        return {
            queryBuilder,
            paginationQuery
        }
    }

    // This function is to return the pagination query object that returns the count, page and skip
    generatePaginationForQueryBuilder(paginationQuery: Pagination) {
        const take = Number(paginationQuery.count) ? Number(paginationQuery.count) : this.defaultCount;
        const page = Number(paginationQuery.page) ? Number(paginationQuery.page) : this.defaultPage;

        const skip = (page - 1) * take;
        return { take, page, skip };
    }

    // Function to generate the filter query
    generateFilterForQueryBuilder(filters: FilterDto[]) {
        const queryObject = [];
        filters?.forEach((filter) => {
            const filterObject = this.getFilterObjectFromFieldName(filter.field);
            const queryParam: QueryParamInterface = this.buildQueryParam(filter, filterObject);
            const query = this.filterQueryBuilderFactory.generateQuery(queryParam);

            // ####################################################
            //  HAVE SOME DOUBT IN THIS SECTION RECORDSMODEL & RECORDMODEL & RELATIONFIELD
            // ###################################################
            // The below code is for tables that might have some relations
            // so if any filter data is given it also checks the related table for that data and queries it
            if (filterObject.recordsModel) {
                let condition = 'some';
                if (filter.operator === Operators.NOT_IN) {
                    // The condition is changed to every because we want every objects inside to satisfy this not_in condition
                    // if we use some then only some of the data objects will satisfy this condtion which is not the thing we want
                    condition = 'every';
                }

                const relationObject = {
                    [filterObject.recordsModel]: {
                        [condition]: {}
                    }
                }

                // If their is a recordModel within the filterObject then we place the query for that field
                // If not the query is applied to the recordsModel
                // 
                // IF RECORDMODEL EXISTS
                // Eg: relationObject = {
                //     "recordsModelName": {
                //       "some": {
                //         "recordModelName": { ...query }
                //       }
                //     }
                //   }
                // 
                // IF RECORDMODEL DOES NOT EXIST
                // Eg: relationObject = {
                // "recordsModelName": {
                //     "some": { ...query }
                // }
                // }

                if (filterObject.recordModel) {
                    relationObject[filterObject.recordsModel][condition] = {
                        [filterObject.recordModel]: { ...query }
                    }
                }

                queryObject.push(relationObject);
                return;
            }
            // #########################################################
            queryObject.push(query);
        });
        return queryObject;
    }

    buildQueryParam(filter: FilterDto, filterObject: ModuleInterface): QueryParamInterface {
        const queryParam: QueryParamInterface = {
            field: filter.field,
            values: filter.value,
            operator: filter.operator,
            type: filterObject.type,
        }
        // The field in the referred table
        if (filterObject.relationField) {
            queryParam.field = filterObject.relationField;
        }

        if (filterObject.type === FieldType.STRING) {
            if (Array.isArray(queryParam.values)) {
                queryParam.values = queryParam.values.map((value) => this.stringService.escapeSQLCharacters(value));
            } else {
                queryParam.values = this.stringService.escapeSQLCharacters(queryParam.values);
            }
        }

        if (filterObject.type === FieldType.NUMBER ||
            filterObject.type === FieldType.DECIMAL ||
            filterObject.type === FieldType.INTEGER
        ) {
            if (Array.isArray(queryParam.values)) {
                queryParam.values = queryParam.values.map((value) => Number(value));
            } else {
                queryParam.values = Number(queryParam.values);
            }
        }

        if (filterObject.type === FieldType.DATE ||
            filterObject.type === FieldType.DATETIME
        ) {
            if (!isNaN(queryParam.values)) {
                queryParam.values = Number(queryParam.values);
            } else {
                if (Array.isArray(queryParam.values)) {
                    queryParam.values = queryParam.values.map((value) => {
                        return DateTime.fromISO(value, {
                            zone: 'UTC'
                        }).toISO();
                    })
                } else {
                    queryParam.values = DateTime.fromISO(queryParam.values, {
                        zone: 'UTC',
                    }).toISO();
                }
            }
        }
        return queryParam;
    }

    generateSortForQueryBuilder(order: OrderByDto, moduleName: ModuleNames = null) {
        if (!this.moduleName) {
            const success = this.setModule(moduleName);
            if (!success) return;
        }
        const field = order?.field || 'createdAt';
        const value = order?.value || 'desc';
        let orderBy: any;
        if (order?.field) {
            const filterObject = this.getFilterObjectFromFieldName(order.field);

            // If recordsModel exists that is the if the filter object has a relation with some other relation then this piece of code gets executed
            // it adds the sorting even to those fields
            if (filterObject.recordsModel) {
                orderBy = {
                    [filterObject.recordsModel]: {
                        [field]: value
                    }
                }
            }
        }

        if (!orderBy) {
            orderBy = {
                [field]: value
            }
        }
        return {
            orderBy
        };
    }
}
