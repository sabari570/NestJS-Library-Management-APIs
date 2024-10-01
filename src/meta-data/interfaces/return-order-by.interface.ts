import { OrderByValue } from "../enums/order-value.enum";

export default interface ReturnOrderBy {
    [keys: string]: OrderByValue;
}