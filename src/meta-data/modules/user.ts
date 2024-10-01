import { FieldType } from "../enums/field-type.enum";
import ModuleInterface from "../interfaces/filter.interface";

export default function userModule(): ModuleInterface[] {
    return [
        {
            field: 'id',
            type: FieldType.NUMBER
        },
        {
            field: 'name',
            type: FieldType.STRING,
        },
        {
            field: 'email',
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
            field: 'loans', // current model field name
            type: FieldType.STRING, // type of the field
            recordsModel: 'Loan',   // the name of the model we are refering
            relationField: 'Book',  // the name of the field to the model we are referring
        }
    ];
}