import {
  IsEnum,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Tech Solutions Inc' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '30-12345678-9' })
  @IsString()
  taxId: string;

  @ApiProperty({ enum: ['PYME', 'CORPORATE'] })
  @IsEnum(['PYME', 'CORPORATE'])
  type: string;

  @ApiProperty({ example: 'contact@company.com' })
  @IsEmail()
  email: string;
}
