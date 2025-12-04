import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/empresa-response.dot';
import { CompaniesService } from './company.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('transfers/last-month')
  getCompaniesWithTransfers(): CompanyResponseDto[] {
    return this.companiesService.getCompaniesWithTransfersLastMonth();
  }

  @Get('registrations/last-month')
  getCompaniesRegistered(): CompanyResponseDto[] {
    return this.companiesService.getCompaniesRegisteredLastMonth();
  }

  @Post('register')
  registerCompany(
    @Body() createCompanyDto: CreateCompanyDto,
  ): CompanyResponseDto {
    return this.companiesService.registerCompany(createCompanyDto);
  }
}
