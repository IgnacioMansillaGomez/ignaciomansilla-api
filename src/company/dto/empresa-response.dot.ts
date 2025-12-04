import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import * as crypto from 'crypto';
import { CompanyType } from 'src/util/enum';

export class CompanyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  taxId: string;

  @ApiProperty({ enum: CompanyType })
  type: CompanyType;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty()
  email: string;
}
