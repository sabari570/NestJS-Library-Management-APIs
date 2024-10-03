import { FilterDto } from "../dto/filter.dto";
import { OrderByDto } from "../dto/order.dto";

export default interface MetaDataInterface {
    count?: number;
    page?: number;
    filter?: FilterDto[],
    order?: OrderByDto,
}