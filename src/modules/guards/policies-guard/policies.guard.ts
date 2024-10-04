import { subject } from "@casl/ability";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppAbility, CaslAbilityFactory } from "src/modules/casl/casl-ability.factory";
import { PERMISSION_CHECKER_KEY, RequiredPermission } from "src/modules/casl/check-policies.decorator";
import { Role } from "src/modules/users/enums/role-status.enum";
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

        // Retrieves the request (includes params and body)
        const request = context.switchToHttp().getRequest();
        const params = request.params;
        const currentUser = this.userService.getCurrentUser();

        // If the params are empty and the currentUser is not an admin then it throws an error
        if (Object.keys(params).length === 0) {
            if (currentUser?.role !== Role.ADMIN) {
                throw new ForbiddenException([
                    'Sorry, you don’t have access to this API endpoint.',
                ]);
            }
        }

        // Retrieves the abilities of the currentUser
        const ability = await this.caslAbilityFactory.createForUser(currentUser)

        return requiredPermissions.every((permission) => this.isAllowed(ability, permission, params));
    }

    private isAllowed(
        ability: AppAbility,
        permission: RequiredPermission,
        params: any
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
                ForbiddenParamName = `id: ${params[param]}`;
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