import { FilterDto } from "../dto/filter.dto";
import ReturnOrderBy from "./return-order-by.interface";

export default interface ReturnMetaData {
    totalRecords?: number;
    totalRecordsWithFilter?: number;
    countPerPage?: number;
    page?: number;
    totalPages?: number;
    filters?: FilterDto[];
    searchKey?: string;
    orderBy?: ReturnOrderBy;
}