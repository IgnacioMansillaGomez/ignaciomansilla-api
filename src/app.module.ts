import { Module } from '@nestjs/common';
import { CompaniesModule } from './empresa/company.module';

@Module({
  imports: [CompaniesModule],
})
export class AppModule {}
