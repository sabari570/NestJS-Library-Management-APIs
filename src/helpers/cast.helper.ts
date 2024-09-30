import { positiveIntRegex } from "src/constants/regex.constants";

interface ToNumberOptions {
    default?: number,
    min?: number,
    max?: number,
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
    let newValue: number;
    if (positiveIntRegex.test(value.trim())) {
        newValue = Number.parseInt(value);
    } else {
        newValue = opts.default || 1;
    }

    if ((opts?.min && newValue < opts.min) || (opts?.max && newValue > opts.max)) {
        newValue = opts.default;
    }
    return newValue;
}