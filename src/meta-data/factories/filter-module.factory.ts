import { Injectable } from '@nestjs/common';
import { ModuleNames } from '../enums/modules.enum';
import userModule from '../modules/user';

@Injectable()
export class FilterModuleFactory {
    getFilterObject(module) {
        switch (module) {
            case ModuleNames.USERS:
                return userModule();
            default: break;
        }
    }
}
