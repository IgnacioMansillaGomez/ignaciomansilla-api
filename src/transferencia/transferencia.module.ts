import { Module } from '@nestjs/common';
import { TransferenciaService } from './transferencia.service';
import { TransferenciaController } from './transferencia.controller';

@Module({
  controllers: [TransferenciaController],
  providers: [TransferenciaService],
})
export class TransferenciaModule {}
