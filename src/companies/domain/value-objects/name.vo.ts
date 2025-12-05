export class Name {
  private readonly value: string;

  constructor(Name: string) {
    this.value = Name;
  }

  getValue(): string {
    return this.value;
  }
}
