import {
  IsEnum,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';
import { CompanyType } from 'src/util/enum';

export class CreateCompanyDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(11)
  taxId: string;

  @IsEnum(CompanyType)
  type: CompanyType;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
