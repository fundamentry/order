import { type Comparable } from '@fundamentry/trait';

export namespace Comparator {
  export type Compare<T> = (a: T, b: T) => number;
}

export class Comparator<T> {
  readonly #compare: Comparator.Compare<T>;

  private constructor(compare: Comparator.Compare<T>) {
    this.#compare = compare;
  }

  static of<T>(compare: Comparator.Compare<T>): Comparator<T> {
    return new Comparator(compare);
  }

  static naturalOrder<T extends Comparable<T>>(): Comparator<T> {
    return new Comparator((a, b) => a.compareTo(b));
  }

  static reverseOrder<T extends Comparable<T>>(): Comparator<T> {
    return Comparator.naturalOrder<T>().reversed();
  }

  static undefinedFirst<T>(
    comparator: Comparator<T>
  ): Comparator<T | undefined>;

  static undefinedFirst<T extends Comparable<T>>(
    comparator?: Comparator<T>
  ): Comparator<T | undefined>;

  static undefinedFirst<T>(
    comparator: Comparator<T> = Comparator.naturalOrder() as unknown as Comparator<T>
  ): Comparator<T | undefined> {
    return Comparator.of((a, b) => {
      if (a === undefined) return b === undefined ? 0 : -1;
      if (b === undefined) return 1;

      return comparator.compare(a, b);
    });
  }

  static undefinedLast<T>(comparator: Comparator<T>): Comparator<T | undefined>;

  static undefinedLast<T extends Comparable<T>>(
    comparator?: Comparator<T>
  ): Comparator<T | undefined>;

  static undefinedLast<T>(
    comparator: Comparator<T> = Comparator.naturalOrder() as unknown as Comparator<T>
  ): Comparator<T | undefined> {
    return Comparator.undefinedFirst(comparator.reversed()).reversed();
  }

  static comparingWith<T, U>(
    mapper: (value: T) => U,
    comparator: Comparator<U>
  ): Comparator<T>;

  static comparingWith<T, U extends Comparable<U>>(
    mapper: (value: T) => U,
    comparator?: Comparator<U>
  ): Comparator<T>;

  static comparingWith<T, U>(
    mapper: (value: T) => U,
    comparator: Comparator<U> = Comparator.naturalOrder() as unknown as Comparator<U>
  ): Comparator<T> {
    return new Comparator((a, b) => comparator.compare(mapper(a), mapper(b)));
  }

  static comparingNumber<T>(mapper: (value: T) => number): Comparator<T> {
    return Comparator.comparingWith(
      mapper,
      Comparator.of((a, b) => (a === b ? 0 : Math.sign(a - b)))
    );
  }

  static comparingString<T>(mapper: (value: T) => string): Comparator<T> {
    return Comparator.comparingWith(
      mapper,
      Comparator.of((a, b) => a.localeCompare(b))
    );
  }

  static comparingBoolean<T>(mapper: (value: T) => boolean): Comparator<T> {
    return Comparator.comparingWith(
      mapper,
      Comparator.of((a, b) => Number(a) - Number(b))
    );
  }

  static comparingOptionalWith<T, U>(
    mapper: (value: T) => U | undefined,
    comparator: Comparator<U>
  ): Comparator<T>;

  static comparingOptionalWith<T, U extends Comparable<U>>(
    mapper: (value: T) => U | undefined,
    comparator?: Comparator<U>
  ): Comparator<T>;

  static comparingOptionalWith<T, U>(
    mapper: (value: T) => U | undefined,
    comparator: Comparator<U> = Comparator.naturalOrder() as unknown as Comparator<U>
  ): Comparator<T> {
    return Comparator.comparingWith(
      mapper,
      Comparator.undefinedFirst(comparator)
    );
  }

  compare(a: T, b: T): number {
    return this.#compare(a, b);
  }

  reversed(): Comparator<T> {
    return new Comparator((a, b) => this.#compare(b, a));
  }

  thenComparing(next: Comparator<T>): Comparator<T> {
    return new Comparator((a, b) => {
      const result = this.#compare(a, b);

      return result !== 0 ? result : next.compare(a, b);
    });
  }

  thenComparingByWith<U>(
    mapper: (value: T) => U,
    comparator: Comparator<U>
  ): Comparator<T>;

  thenComparingByWith<U extends Comparable<U>>(
    mapper: (value: T) => U,
    comparator?: Comparator<U>
  ): Comparator<T>;

  thenComparingByWith<U>(
    mapper: (value: T) => U,
    comparator: Comparator<U> = Comparator.naturalOrder() as unknown as Comparator<U>
  ): Comparator<T> {
    return this.thenComparing(Comparator.comparingWith(mapper, comparator));
  }

  thenComparingByNumber(mapper: (value: T) => number): Comparator<T> {
    return this.thenComparing(Comparator.comparingNumber(mapper));
  }

  thenComparingByString(mapper: (value: T) => string): Comparator<T> {
    return this.thenComparing(Comparator.comparingString(mapper));
  }

  thenComparingByBoolean(mapper: (value: T) => boolean): Comparator<T> {
    return this.thenComparing(Comparator.comparingBoolean(mapper));
  }

  thenComparingByOptionalWith<U>(
    mapper: (value: T) => U | undefined,
    comparator: Comparator<U>
  ): Comparator<T>;

  thenComparingByOptionalWith<U extends Comparable<U>>(
    mapper: (value: T) => U | undefined,
    comparator?: Comparator<U>
  ): Comparator<T>;

  thenComparingByOptionalWith<U>(
    mapper: (value: T) => U | undefined,
    comparator: Comparator<U> = Comparator.naturalOrder() as unknown as Comparator<U>
  ): Comparator<T> {
    return this.thenComparing(
      Comparator.comparingOptionalWith(mapper, comparator)
    );
  }
}
