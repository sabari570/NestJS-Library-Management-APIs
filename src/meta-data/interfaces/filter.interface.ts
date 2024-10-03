import { FieldType } from "../enums/field-type.enum";

export default interface ModuleInterface {
    field: string,
    type: FieldType,
    order?: boolean,    // this is given whether to ensure that this field is sortable or not
    relationField?: string, // this tells us which field are we refering to in the refered table
    recordsModel?: string,  // this refers to the model used to which oru model is linked represent multiple entities
    recordModel?: string,   // this refers to the model that represents a single entity or record within a module.
}