import { Test, TestingModule } from '@nestjs/testing';
import { WagesController } from './wages.controller';

describe('WagesController', () => {
  let controller: WagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WagesController],
    }).compile();

    controller = module.get<WagesController>(WagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
