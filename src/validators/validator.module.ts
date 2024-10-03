import { Module } from "@nestjs/common";
import { hasFilterModuleConstraint } from "./has-filter-module.validator";
import { IsCorrectOperatorConstraint } from "./is-correct-operator.validator";
import { IsCorrectValueConstraint } from "./is-correct-value.validator";
import { IsFiltetFieldConstraint } from "./is-filter-field.validator";
import { IsRecordExistConstraint } from "./is-record-exists.validator";

@Module({
    imports: [],
    providers: [
        hasFilterModuleConstraint,
        IsCorrectOperatorConstraint,
        IsCorrectValueConstraint,
        IsFiltetFieldConstraint,
        IsRecordExistConstraint,
    ],
})
export class ValidatorModule { }