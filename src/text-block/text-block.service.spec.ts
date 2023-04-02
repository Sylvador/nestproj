import { Test, TestingModule } from '@nestjs/testing';
import { TextBlockService } from './text-block.service';

describe('TextBlockService', () => {
  let service: TextBlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextBlockService],
    }).compile();

    service = module.get<TextBlockService>(TextBlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
