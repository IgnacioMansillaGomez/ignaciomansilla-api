// src/companies/companies.module.ts
import { Module } from '@nestjs/common';
import { CompaniesController } from './infrastructure/adapters/inbound/http/controller/company.controller'; // ⭐ Fixed path
import { CompanyService } from './application/use-cases/company.service';
import { InMemoryCompanyRepository } from './infrastructure/adapters/outbound/persistence/in-memory-company.repository';
import { InMemoryTransferRepository } from './infrastructure/adapters/outbound/persistence/in-memory-transfer.repository';

@Module({
  controllers: [CompaniesController],
  providers: [
    {
      provide: 'ICompanyUseCases',
      useClass: CompanyService,
    },
    {
      provide: 'ICompanyRepository',
      useClass: InMemoryCompanyRepository,
    },
    {
      provide: 'ITransferRepository',
      useClass: InMemoryTransferRepository,
    },
  ],
  exports: ['ICompanyUseCases'],
})
export class CompaniesModule {}
