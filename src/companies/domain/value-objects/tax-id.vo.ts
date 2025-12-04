export class TaxId {
  private readonly value: string;

  constructor(taxId: string) {
    this.validate(taxId);
    this.value = taxId;
  }

  private validate(taxId: string): void {
    const taxIdRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!taxIdRegex.test(taxId)) {
      throw new Error('Invalid tax ID format. Expected: XX-XXXXXXXX-X');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TaxId): boolean {
    return this.value === other.getValue();
  }
}
