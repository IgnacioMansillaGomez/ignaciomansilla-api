export class Email {
  private readonly value: string;

  constructor(Email: string) {
    this.value = Email;
    this.validate();
  }
  validate() {
    if (!this.value.includes('@')) {
      throw new Error('Invalid email format');
    }
  }

  getValue(): string {
    return this.value;
  }
}
