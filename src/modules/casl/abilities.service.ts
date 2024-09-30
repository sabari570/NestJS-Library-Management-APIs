import { Injectable, Logger } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { UsersService } from '../users/users.service';

@Injectable()
export class AbilitiesService {
    constructor(private caslAbilityFactory: CaslAbilityFactory,
        private userService: UsersService,
        private readonly loggerService: Logger
    ) { }

    // To extract the abiliities of current user
    async getCurrentUserAbilities() {
        this.loggerService.log(`Aibilities > getCurrentUserAbbilities(): called`);

        try {
            const { rules } = this.caslAbilityFactory.createForUser(
                this.userService.getCurrentUser()
            )
            return rules;
        } catch (error) {

        }
    }
}
