import { Ability, subject } from "@casl/ability";
import { Action } from "../enums/actions.enum";
import { Subject } from "../enums/subjects.enum";

export default function createUserAbility(userId: string) {
    return new Ability<[Action, Subject]>([
        {
            action: Action.READ,
            subject: Subject.USER,
            conditions: { id: userId },
        },
        // User can update their own user data
        {
            action: Action.UPDATE,
            subject: Subject.USER,
            conditions: { id: userId },
        },
        // User can delete their own user data
        {
            action: Action.DELETE,
            subject: Subject.USER,
            conditions: { id: userId },
        },
    ]);
}
