import { Ability } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import UserInterface from "../users/interface/user.interface";
import { Role } from "../users/enums/role-status.enum";
import admin from "../casl/abilities/admin.ability"
import createUserAbility from "./abilities/user.ability";

export type AppAbility = Ability

// This is the code which returns the abilities based on the user logged in
@Injectable()
export class CaslAbilityFactory {
    createForUser(user: UserInterface) {
        switch (user.role) {
            // If the user logged in is ADMIN then,
            case Role.ADMIN: {
                return admin;
            }

            // If the user logged in is USER then,
            case Role.USER: {
                return createUserAbility(user.id);
            }
            default: break;
        }
    }
}