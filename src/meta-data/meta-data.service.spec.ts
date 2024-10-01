import { Test, TestingModule } from '@nestjs/testing';
import { MetaDataService } from './meta-data.service';

describe('MetaDataService', () => {
  let service: MetaDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetaDataService],
    }).compile();

    service = module.get<MetaDataService>(MetaDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
