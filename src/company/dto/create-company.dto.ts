import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { CompanyType } from 'src/util/enum';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Tech Solutions Inc', description: 'Company name' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: '30-12345678-9',
    description: 'Tax identification number',
  })
  @IsString()
  @MinLength(11)
  @Matches(/^\d{2}-\d{8}-\d{1}$/, {
    message: 'Tax ID must follow format XX-XXXXXXXX-X',
  })
  taxId: string;

  @ApiProperty({ enum: CompanyType, example: CompanyType.PYME })
  @IsEnum(CompanyType)
  type: CompanyType;

  @ApiProperty({ example: 'contact@company.com' })
  @IsEmail()
  email: string;
}
