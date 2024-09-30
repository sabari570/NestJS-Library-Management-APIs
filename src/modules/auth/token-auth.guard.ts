import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../users/enums/role-status.enum";

@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
    private userService: UsersService;
    constructor(
        private jwtService: JwtService,
        private moduleRef: ModuleRef) { }

    async canActivate(context: ExecutionContext): Promise<any> {
        return this.validateAccessToken(context);
    }

    async validateAccessToken(context: ExecutionContext) {
        const [req] = context.getArgs();
        if (!req || !req.cookies || !req.cookies.accessToken) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(req.cookies.accessToken, {
                secret: process.env.JWT_SECRET,
                algorithms: ['HS256']
            });

            return await this.validate(req, payload);
        } catch (error) {
            console.log(`AccessTokenAuthGuard > validateAccessToken(): Error - Token not valid, ${error}`);
            throw new UnauthorizedException('Invalid access token');
        }
    }

    async validate(request, payload: any) {
        // For dyanamically resolving services using moduleRef we require contextId
        // for that we pass the request to the ContextIdFactory.getByRequest() function
        const contextId = ContextIdFactory.getByRequest(request);   //This line creates a unique context ID based on the current HTTP request.

        //  you're telling NestJS to resolve the service in the context of the current request. This is particularly important for request-scoped providers, where each request
        // should get its own instance of the service.

        // { strict: false }: This option is used to tell the ModuleRef to be more flexible about resolving dependencies. 
        // If strict were true, it would only look for the UsersService within the current module, 
        // but with strict: false, it will try to resolve it globally across all available modules in the application.
        this.userService = await this.moduleRef.resolve(UsersService, contextId, { strict: false });
        const userId = payload["id"];

        let getUserData: any = {}
        try {
            getUserData = await this.userService.setCurrentUser(userId);
        } catch (error) {
            console.log(`AccessTokenAuthGuard > validate(): setCurrentUser error - ${error}`);
        }
        if (getUserData.role === Role.ADMIN) {
            return true;
        }
        return !!payload.id;
    }
}