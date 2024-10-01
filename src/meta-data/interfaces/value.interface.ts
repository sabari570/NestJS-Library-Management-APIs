import { FieldType } from "../enums/field-type.enum";

export default interface ValueInterface {
    value?: any;
    type?: FieldType,
    mainType?: FieldType,
}