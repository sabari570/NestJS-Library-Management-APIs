import { FieldType } from "../enums/field-type.enum";
import ModuleInterface from "../interfaces/filter.interface";

export default function authorModule(): ModuleInterface[] {
    return [
        {
            field: 'id',
            type: FieldType.STRING,
        },
        {
            field: 'name',
            type: FieldType.STRING,
        },
        {
            field: 'createdAt',
            type: FieldType.DATE,
        },
        {
            field: 'updatedAt',
            type: FieldType.DATE,
        },
        {
            field: 'books',
            type: FieldType.STRING,
            recordsModel: 'Book',
            relationField: 'title'
        }
    ];
}