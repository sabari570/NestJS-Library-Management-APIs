import { Injectable } from "@nestjs/common";

// Declaring the type of the enum value
export type EnumValueType = string | number;

@Injectable()
export class EnumService {
    // T is a generic type placeholder. This means that the type T will be determined based on what is passed into the method when it's called.
    // The extends keyword here is used to restrict what types can be used in place of T. In this case, T must extend the type EnumValueType.
    getKeysAndValues<T extends EnumValueType>(myEnum: any): { name: string, value: T }[] {
        return this.getKeys(myEnum).map((name) => {
            return { name: name, value: myEnum[name] as T };
        });
    }

    getKeys(myEnum: any): string[] {
        return Object.keys(myEnum).filter((key) => isNaN(+key));
    }

    getValues<T extends EnumValueType>(myEnum: any): T[] {
        return this.getKeys(myEnum).map((name) => myEnum[name] as T);
    }

    getKeyFromValue<T extends EnumValueType>(myEnum: any, enumValue: T): string | null {
        const all = this.getKeysAndValues(myEnum).filter(
            (pair) => pair.value === enumValue
        );
        return all.length === 1 ? all[0].name : null;
    }
}