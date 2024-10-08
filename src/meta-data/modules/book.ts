import { FieldType } from "../enums/field-type.enum";
import ModuleInterface from "../interfaces/filter.interface";

export default function booksModule(): ModuleInterface[] {
    return [
        {
            field: 'id',
            type: FieldType.STRING,
        },
        {
            field: 'title',
            type: FieldType.STRING,
        },
        {
            field: 'isbn',
            type: FieldType.STRING,
        },
        {
            field: 'published',
            type: FieldType.DATETIME,
        },

        // ##################
        // FILTER ACCORDING TO THE AUTHOR NAME (LATER)
        // #################
        // {
        //     field: 'authors',
        //     type: FieldType.STRING,
        //     recordsModel: 'Author',
        //     relationField: 'title'
        // }
    ];
}