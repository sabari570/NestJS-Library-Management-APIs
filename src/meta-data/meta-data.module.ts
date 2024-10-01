import { Global, Logger, Module } from '@nestjs/common';
import { MetaDataService } from './meta-data.service';
import { FilterModuleFactory } from './factories/filter-module.factory';
import { FilterOperatorFactory } from './factories/filter-operator.factory';
import { FilterValueFactory } from './factories/filter-value.factory';
import { FilterQueryBuilderFactory } from './factories/filter-query-builder.factory';
import { EnumService } from 'src/helpers/enum.service';
import { StringService } from 'src/helpers/string.service';

@Global()
@Module({
    providers: [
        MetaDataService,
        FilterModuleFactory,
        FilterOperatorFactory,
        FilterValueFactory,
        FilterQueryBuilderFactory,
        EnumService,
        StringService,
        Logger,
    ],
    exports: [MetaDataService, FilterModuleFactory, FilterOperatorFactory]
})
export class MetaDataModule { }
