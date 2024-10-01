import { Operators } from "./operators.enum";

export enum StringOperators {
    EQUAL = Operators.EQUAL,
    NOT_EQUALS = Operators.NOT_EQUALS,
    CONTAINS = Operators.CONTAINS,
    NOT_CONTAINS = Operators.NOT_CONTAINS,
    STARTS_WITH = Operators.STARTS_WITH,
    ENDS_WITH = Operators.ENDS_WITH,
    IS_BLANK = Operators.IS_BLANK,
    NOT_BLANK = Operators.NOT_BLANK,
}