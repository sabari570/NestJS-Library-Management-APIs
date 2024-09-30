import { Global, Logger, Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { AbilitiesService } from './abilities.service';
import { AbilitiesController } from './abilities.controller';
import { UsersModule } from '../users/users.module';
import { JwtService } from '@nestjs/jwt';

// *******************
// CASL => Code Access Security Language
// This module is created to actually allow the users certain access based on their roles
// ADMIN have all access whereas USERs have limited access to the APIs
// *******************
@Global()
@Module({
    imports: [UsersModule],
    providers: [
        CaslAbilityFactory,
        AbilitiesService,
        Logger,
        JwtService
    ],
    exports: [CaslAbilityFactory],
    controllers: [AbilitiesController],
})
export class CaslModule { }
