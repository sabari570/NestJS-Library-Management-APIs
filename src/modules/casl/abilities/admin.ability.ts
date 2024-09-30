import { Ability } from "@casl/ability";
import { Action } from "../enums/actions.enum";
import { Subject } from "../enums/subjects.enum";

export default new Ability<[Action, Subject]>([
    // Admin can create users
    {
        action: Action.CREATE,
        subject: Subject.USER,
    },
    // Admin can read (view) all users
    {
        action: Action.READ,
        subject: Subject.USER,
    },
    // Admin can update any user
    {
        action: Action.UPDATE,
        subject: Subject.USER,
    },
    // Admin can delete any user
    {
        action: Action.DELETE,
        subject: Subject.USER,
    },

    // Admin can manage all other relevant subjects
    {
        action: Action.CREATE,
        subject: Subject.BOOK,
    },
    {
        action: Action.UPDATE,
        subject: Subject.BOOK,
    },
    {
        action: Action.DELETE,
        subject: Subject.BOOK,
    },
    {
        action: Action.READ,
        subject: Subject.BOOK,
    },
]);
