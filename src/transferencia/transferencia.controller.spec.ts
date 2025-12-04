import { Test, TestingModule } from '@nestjs/testing';
import { TransferenciaController } from './transferencia.controller';
import { TransferenciaService } from './transferencia.service';

describe('TransferenciaController', () => {
  let controller: TransferenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferenciaController],
      providers: [TransferenciaService],
    }).compile();

    controller = module.get<TransferenciaController>(TransferenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
