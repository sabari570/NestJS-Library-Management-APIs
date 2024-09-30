import { subject } from "@casl/ability";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppAbility, CaslAbilityFactory } from "src/modules/casl/casl-ability.factory";
import { PERMISSION_CHECKER_KEY, RequiredPermission } from "src/modules/casl/check-policies.decorator";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class PolciesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
        private readonly userService: UsersService
    ) { }

    async canActivate(context: ExecutionContext) {
        const requiredPermissions =
            // Reflector is actually used to extract the metadata stored inside the customDecorator
            this.reflector.get<RequiredPermission[]>(
                PERMISSION_CHECKER_KEY,
                context.getHandler()
            ) || [];

        // Retrieves the request body
        const params = context.switchToHttp().getRequest().body;

        // Retrieves the abilities of the currentUser
        const ability = await this.caslAbilityFactory.createForUser(this.userService.getCurrentUser())

        return requiredPermissions.every((permission) => this.isAllowed(ability, permission, params));
    }

    private isAllowed(
        ability: AppAbility,
        permission: RequiredPermission,
        params
    ): boolean {
        let ForbiddenParamName;
        console.log("Params obtained: ", params)
        const subjectAccess = ability.can(permission[0], permission[1]);

        if (!subjectAccess) {
            throw new ForbiddenException([
                'Sorry, you don’t have access to this API endpoint.',
            ]);
        }

        const paramsAccess = Object.keys(params).every((param) => {
            const paramAccess = ability.can(
                permission[0],
                subject(permission[1], { [param]: params[param] }),
                param
            )

            if (!paramAccess) {
                ForbiddenParamName = param;
                return false;
            }
            return true;
        })
        if (!paramsAccess) {
            throw new ForbiddenException([
                `Sorry, you dot't have access to ${ForbiddenParamName}`,
            ])
        }
        return true;
    }
}