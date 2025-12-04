import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { QueryCompaniesDto } from '../dtos/query-companies.dto';
import type { ICompanyUseCases } from 'src/companies/application/ports/inbound/company.uses-cases';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    @Inject('ICompanyUseCases')
    private readonly companyUseCases: ICompanyUseCases,
  ) {}

  @Get('transfers/last-month')
  @ApiOperation({ summary: 'Get companies with transfers in the last month' })
  async getCompaniesWithTransfers() {
    return await this.companyUseCases.getCompaniesWithRecentTransfers();
  }

  @Get('registrations/last-month')
  @ApiOperation({ summary: 'Get companies registered in the last month' })
  async getCompaniesRegistered() {
    return await this.companyUseCases.getRecentlyRegisteredCompanies();
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies with filters and pagination' })
  async findAll(@Query() queryParams: QueryCompaniesDto) {
    return await this.companyUseCases.findAllCompanies(
      {
        type: queryParams.type,
        status: queryParams.status,
        search: queryParams.search,
      },
      {
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@Param('id') id: string) {
    return await this.companyUseCases.findCompanyById(id);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new company' })
  @HttpCode(HttpStatus.CREATED)
  async registerCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companyUseCases.registerCompany(createCompanyDto);
  }
}
