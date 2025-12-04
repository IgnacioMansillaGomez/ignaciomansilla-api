import { Module } from '@nestjs/common';
import { CompaniesModule } from './company/company.module';

@Module({
  imports: [CompaniesModule],
})
export class AppModule {}
