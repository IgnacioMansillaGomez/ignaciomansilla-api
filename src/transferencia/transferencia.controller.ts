import { Controller } from '@nestjs/common';
import { TransferenciaService } from './transferencia.service';

@Controller('transferencia')
export class TransferenciaController {
  constructor(private readonly transferenciaService: TransferenciaService) {}
}
