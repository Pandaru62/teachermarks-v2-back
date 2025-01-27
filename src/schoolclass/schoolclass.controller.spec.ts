import { Test, TestingModule } from '@nestjs/testing';
import { SchoolclassController } from './schoolclass.controller';

describe('SchoolclassController', () => {
  let controller: SchoolclassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolclassController],
    }).compile();

    controller = module.get<SchoolclassController>(SchoolclassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
