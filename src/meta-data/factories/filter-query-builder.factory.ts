import { Injectable } from "@nestjs/common";
import { FieldType } from "../enums/field-type.enum";
import { DateTime } from 'luxon'
import { Operators } from "../enums/operators/operators.enum";
import QueryParamInterface from "../interfaces/query-param.interface";

@Injectable()
export class FilterQueryBuilderFactory {

    // This function generates the query syntac for prisma to retrieve the data from DB
    generateQuery({ field, values, operator, type }: QueryParamInterface) {
        // let plusDay;
        // if (type === FieldType.DATE || type === FieldType.DATETIME) {
        //     plusDay = DateTime.fromISO(values, {
        //         zone: 'UTC'
        //     }).plus({ days: 1 })
        //         .toISO();
        // }

        switch (operator) {
            case Operators.EQUAL:
                return {
                    [field]: {
                        equals: values
                    }
                }
            case Operators.NOT_EQUALS:
                return {
                    [field]: {
                        not: values
                    }
                }
            case Operators.CONTAINS:
                return {
                    [field]: {
                        contains: values
                    }
                }
            case Operators.NOT_CONTAINS:
                return {
                    NOT: {
                        [field]: {
                            contains: values
                        }
                    }
                }
            case Operators.STARTS_WITH:
                return {
                    [field]: {
                        startsWith: values
                    }
                }
            case Operators.ENDS_WITH:
                return {
                    [field]: {
                        endsWith: values,
                    }
                }
            case Operators.LTE:
            case Operators.BEFORE:
                return {
                    [field]: {
                        lte: values,
                    }
                }
            case Operators.LT:
                return {
                    [field]: {
                        lt: values
                    }
                }
            case Operators.GTE:
            case Operators.AFTER:
                return {
                    [field]: {
                        gte: values,
                    }
                }
            case Operators.GT:
                return {
                    [field]: {
                        gt: values
                    }
                }
            case Operators.IN:
                return {
                    [field]: {
                        in: Array.isArray(values) ? values : [values]
                    }
                }
            case Operators.NOT_IN:
                return {
                    [field]: {
                        notin: Array.isArray(values) ? values : [values]
                    }
                }
            case Operators.BETWEEN:
                return {
                    [field]: {
                        gte: values[0],
                        lt: values[1]
                    }
                }
            case Operators.IS_BLANK:
                return {
                    OR: [
                        {
                            [field]: {
                                equals: ''
                            },
                        },
                        {

                            [field]: null
                        }
                    ]
                }
            case Operators.NOT_BLANK:
                return {
                    AND: [
                        {
                            [field]: {
                                not: ''
                            }
                        },
                        {
                            [field]: {
                                not: null,
                            }
                        }
                    ]
                }
            default: break;
        }
    }
}