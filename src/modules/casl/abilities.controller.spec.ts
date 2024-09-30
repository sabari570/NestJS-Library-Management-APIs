import { Test, TestingModule } from '@nestjs/testing';
import { AbilitiesController } from './abilities.controller';

describe('AbilitiesController', () => {
  let controller: AbilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbilitiesController],
    }).compile();

    controller = module.get<AbilitiesController>(AbilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
