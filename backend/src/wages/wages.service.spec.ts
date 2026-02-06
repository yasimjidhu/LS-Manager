import { Test, TestingModule } from '@nestjs/testing';
import { WagesService } from './wages.service';

describe('WagesService', () => {
  let service: WagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WagesService],
    }).compile();

    service = module.get<WagesService>(WagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
