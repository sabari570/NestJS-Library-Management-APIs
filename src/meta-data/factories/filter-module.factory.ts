import { Injectable } from '@nestjs/common';
import { ModuleNames } from '../enums/modules.enum';
import userModule from '../modules/user';
import authorModule from '../modules/author';
import categoriesModule from '../modules/categories';
import booksModule from '../modules/book';

@Injectable()
export class FilterModuleFactory {
    getFilterObject(module) {
        switch (module) {
            case ModuleNames.USERS:
                return userModule();
            case ModuleNames.AUHTORS:
                return authorModule();
            case ModuleNames.CATEGORIES:
                return categoriesModule();
            case ModuleNames.BOOKS:
                return booksModule();
            default: break;
        }
    }
}
