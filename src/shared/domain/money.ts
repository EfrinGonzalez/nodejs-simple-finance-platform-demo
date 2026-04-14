export class Currency {
  private constructor(public readonly code: string) {}

  public static of(code: string): Currency {
    const normalized = code.toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new Error(`Invalid currency code: ${code}`);
    }
    return new Currency(normalized);
  }
}

export class Money {
  private constructor(
    public readonly cents: number,
    public readonly currency: Currency
  ) {
    if (!Number.isInteger(cents)) {
      throw new Error('Money cents must be an integer');
    }
  }

  public static of(cents: number, currency: Currency): Money {
    if (cents < 0) {
      throw new Error('Money cannot be negative');
    }
    return new Money(cents, currency);
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.cents + other.cents, this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.cents - other.cents;
    if (result < 0) {
      throw new Error('Insufficient amount');
    }
    return new Money(result, this.currency);
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents >= other.cents;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency.code !== other.currency.code) {
      throw new Error('Currency mismatch');
    }
  }
}
