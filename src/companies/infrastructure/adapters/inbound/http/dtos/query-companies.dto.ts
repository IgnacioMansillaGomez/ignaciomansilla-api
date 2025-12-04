import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryCompaniesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['PYME', 'CORPORATE'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'PENDING'])
  status?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
