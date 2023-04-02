import { Test, TestingModule } from '@nestjs/testing';
import { TextBlockController } from './text-block.controller';
import { TextBlockService } from './text-block.service';

describe('TextBlockController', () => {
  let controller: TextBlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextBlockController],
      providers: [TextBlockService],
    }).compile();

    controller = module.get<TextBlockController>(TextBlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
