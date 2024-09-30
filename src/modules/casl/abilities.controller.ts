import { Controller, Get, UseGuards } from '@nestjs/common';
import { AbilitiesService } from './abilities.service';
import { AccessTokenAuthGuard } from '../auth/token-auth.guard';

@Controller('abilities')
export class AbilitiesController {
    constructor(private abilitiesService: AbilitiesService) { }

    // This decorator is added to allow only authorised users to access this route
    @UseGuards(AccessTokenAuthGuard)
    @Get()
    async find() {
        return this.abilitiesService.getCurrentUserAbilities();
    }
}
