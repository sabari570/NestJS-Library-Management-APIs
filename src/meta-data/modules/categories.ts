import { FieldType } from "../enums/field-type.enum";
import ModuleInterface from "../interfaces/filter.interface";

export default function categoriesModule(): ModuleInterface[] {
    return [
        {
            field: 'id',
            type: FieldType.STRING,
        },
        {
            field: 'name',
            type: FieldType.STRING,
        },
         // ##################
        // FILTER ACCORDING TO THE BOOK NAME (LATER)
        // #################
        // {
        //     field: 'books',
        //     type: FieldType.STRING,
        //     recordsModel: 'Book',
        //     relationField: 'title'
        // }
    ];
}