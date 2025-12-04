import { CompanyType } from 'src/util/enum';
import { Company } from './company.entity';

describe('Company Entity', () => {
  let company: Company;

  beforeEach(() => {
    company = new Company(
      '1',
      'Test Company',
      '30-12345678-9',
      CompanyType.PYME,
      'email@example.com',
      new Date('2024-11-20'),
    );
  });

  describe('Creation', () => {
    it('should create a company with all fields', () => {
      expect(company.id).toBe('1');
      expect(company.name).toBe('Test Company');
      expect(company.taxId).toBe('30-12345678-9');
      expect(company.type).toBe(CompanyType.PYME);
      expect(company.email).toBe('email@example.com');
      expect(company.registrationDate).toEqual(new Date('2024-11-20'));
    });
  });

  describe('isRegisteredInLastMonth', () => {
    it('should return true for company registered 15 days ago', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);

      const recentCompany = new Company(
        '3',
        'Recent Company',
        '30-11111111-1',
        CompanyType.PYME,
        'test@gmail.com',
        recentDate,
      );

      expect(recentCompany.isRegisteredInLastMonth()).toBe(true);
    });

    it('should return false for company registered 45 days ago', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 45);

      const oldCompany = new Company(
        '4',
        'Old Company',
        '30-22222222-2',
        CompanyType.PYME,
        'test2@gmail.com',
        oldDate,
      );

      expect(oldCompany.isRegisteredInLastMonth()).toBe(false);
    });

    it('should return true for company registered exactly 30 days ago', () => {
      const exactDate = new Date();
      exactDate.setDate(exactDate.getDate() - 30);

      const exactCompany = new Company(
        '5',
        'Exact Company',
        '30-33333333-3',
        CompanyType.CORPORATE,
        'test3@gmail.com',
        exactDate,
      );

      expect(exactCompany.isRegisteredInLastMonth()).toBe(true);
    });
  });
});
