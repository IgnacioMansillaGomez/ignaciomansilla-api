import { TaxId } from './tax-id.vo';

describe('TaxId Value Object', () => {
  describe('Valid Tax IDs', () => {
    it('should create a valid tax ID', () => {
      const taxId = new TaxId('30-12345678-9');
      expect(taxId.getValue()).toBe('30-12345678-9');
    });

    it('should accept different valid formats', () => {
      const validIds = ['30-12345678-9', '20-98765432-1', '27-11111111-0'];

      validIds.forEach((id) => {
        expect(() => new TaxId(id)).not.toThrow();
      });
    });
  });

  describe('Invalid Tax IDs', () => {
    it('should throw error for invalid format', () => {
      expect(() => new TaxId('123456789')).toThrow('Invalid tax ID format');
    });

    it('should throw error for missing hyphens', () => {
      expect(() => new TaxId('30123456789')).toThrow('Invalid tax ID format');
    });

    it('should throw error for wrong length', () => {
      expect(() => new TaxId('30-1234567-9')).toThrow('Invalid tax ID format');
    });

    it('should throw error for letters in numeric parts', () => {
      expect(() => new TaxId('AB-12345678-9')).toThrow('Invalid tax ID format');
    });
  });

  describe('Equality', () => {
    it('should return true for equal tax IDs', () => {
      const taxId1 = new TaxId('30-12345678-9');
      const taxId2 = new TaxId('30-12345678-9');
      expect(taxId1.equals(taxId2)).toBe(true);
    });

    it('should return false for different tax IDs', () => {
      const taxId1 = new TaxId('30-12345678-9');
      const taxId2 = new TaxId('30-98765432-1');
      expect(taxId1.equals(taxId2)).toBe(false);
    });
  });
});
