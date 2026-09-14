import { describe, expect, it } from 'vitest';

import { type Comparable } from '@fundamentry/trait';

import { Comparator } from './Comparator.js';

class Person implements Comparable<Person> {
  readonly #name: string;

  readonly #age: number;

  constructor(name: string, age: number) {
    this.#name = name;
    this.#age = age;
  }

  name() {
    return this.#name;
  }

  age() {
    return this.#age;
  }

  compareTo(other: Person): number {
    return this.#name.localeCompare(other.#name);
  }
}

describe('Comparator', () => {
  describe('of', () => {
    it('must compare using the given function', () => {
      const byLength = Comparator.of<string>((a, b) => a.length - b.length);

      expect(byLength.compare('a', 'bb')).toBeLessThan(0);
      expect(byLength.compare('bb', 'a')).toBeGreaterThan(0);
      expect(byLength.compare('a', 'b')).toBe(0);
    });
  });

  describe('naturalOrder', () => {
    it('must compare using the values own ordering', () => {
      const a = new Person('A', 20);
      const b = new Person('B', 40);

      const comparator = Comparator.naturalOrder<Person>();

      expect(comparator.compare(a, b)).toBeLessThan(0);
      expect(comparator.compare(b, a)).toBeGreaterThan(0);
      expect(comparator.compare(a, a)).toBe(0);
    });
  });

  describe('reverseOrder', () => {
    it('must invert the values own ordering', () => {
      const a = new Person('A', 20);
      const b = new Person('B', 40);

      const comparator = Comparator.reverseOrder<Person>();

      expect(comparator.compare(a, b)).toBeGreaterThan(0);
      expect(comparator.compare(b, a)).toBeLessThan(0);
    });
  });

  describe('undefinedFirst', () => {
    it('must order undefined before any defined value using natural order by default', () => {
      const comparator = Comparator.undefinedFirst<Person>();

      const young = new Person('A', 20);

      expect(comparator.compare(undefined, young)).toBeLessThan(0);
      expect(comparator.compare(young, undefined)).toBeGreaterThan(0);
      expect(comparator.compare(undefined, undefined)).toBe(0);
    });

    it('must delegate to the given comparator when both values are defined', () => {
      const comparator = Comparator.undefinedFirst<Person>(
        Comparator.naturalOrder()
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
      expect(comparator.compare(old, young)).toBeGreaterThan(0);
    });

    it('must support a comparator for a type that is not Comparable', () => {
      const comparator = Comparator.undefinedFirst<number>(
        Comparator.of((a, b) => a - b)
      );

      expect(comparator.compare(undefined, 20)).toBeLessThan(0);
      expect(comparator.compare(20, undefined)).toBeGreaterThan(0);
      expect(comparator.compare(20, 40)).toBeLessThan(0);
    });
  });

  describe('undefinedLast', () => {
    it('must order undefined after any defined value using natural order by default', () => {
      const comparator = Comparator.undefinedLast<Person>();

      const young = new Person('A', 20);

      expect(comparator.compare(undefined, young)).toBeGreaterThan(0);
      expect(comparator.compare(young, undefined)).toBeLessThan(0);
      expect(comparator.compare(undefined, undefined)).toBe(0);
    });

    it('must delegate to the given comparator when both values are defined', () => {
      const comparator = Comparator.undefinedLast<Person>(
        Comparator.naturalOrder()
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
      expect(comparator.compare(old, young)).toBeGreaterThan(0);
    });

    it('must support a comparator for a type that is not Comparable', () => {
      const comparator = Comparator.undefinedLast<number>(
        Comparator.of((a, b) => a - b)
      );

      expect(comparator.compare(undefined, 20)).toBeGreaterThan(0);
      expect(comparator.compare(20, undefined)).toBeLessThan(0);
      expect(comparator.compare(20, 40)).toBeLessThan(0);
    });
  });

  describe('comparingWith', () => {
    it('must compare by the extracted key using the given comparator', () => {
      const byAgeDescending = Comparator.comparingWith<Person, number>(
        person => person.age(),
        Comparator.of((a, b) => b - a)
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(byAgeDescending.compare(young, old)).toBeGreaterThan(0);
      expect(byAgeDescending.compare(old, young)).toBeLessThan(0);
      expect(byAgeDescending.compare(young, young)).toBe(0);
    });

    it('must default to natural order when no comparator is given', () => {
      const byName = Comparator.comparingWith<Person, Person>(person => person);

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(byName.compare(young, old)).toBeLessThan(0);
      expect(byName.compare(old, young)).toBeGreaterThan(0);
      expect(byName.compare(young, young)).toBe(0);
    });
  });

  describe('comparingNumber', () => {
    it('must compare by the extracted numeric key', () => {
      const byAge = Comparator.comparingNumber<Person>(person => person.age());

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(byAge.compare(young, old)).toBe(-1);
      expect(byAge.compare(old, young)).toBe(1);
      expect(byAge.compare(young, young)).toBe(0);
    });

    it('must treat two infinite ages as equal instead of NaN', () => {
      const byAge = Comparator.comparingNumber<Person>(person => person.age());

      const a = new Person('A', Infinity);
      const b = new Person('B', Infinity);

      expect(byAge.compare(a, b)).toBe(0);
    });
  });

  describe('comparingString', () => {
    it('must compare by the extracted string key using locale order', () => {
      const byName = Comparator.comparingString<Person>(person =>
        person.name()
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(byName.compare(young, old)).toBeLessThan(0);
      expect(byName.compare(old, young)).toBeGreaterThan(0);
      expect(byName.compare(young, young)).toBe(0);
    });
  });

  describe('comparingBoolean', () => {
    it('must order false before true', () => {
      const byIsOld = Comparator.comparingBoolean<Person>(
        person => person.age() >= 40
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(byIsOld.compare(young, old)).toBeLessThan(0);
      expect(byIsOld.compare(old, young)).toBeGreaterThan(0);
      expect(byIsOld.compare(young, young)).toBe(0);
    });
  });

  describe('comparingOptionalWith', () => {
    it('must order an absent key before a present one', () => {
      const descending = Comparator.comparingOptionalWith<
        number | undefined,
        number
      >(
        value => value,
        Comparator.of((a, b) => b - a)
      );

      expect(descending.compare(undefined, 20)).toBeLessThan(0);
      expect(descending.compare(20, undefined)).toBeGreaterThan(0);
    });

    it('must compare using the given comparator when both are present', () => {
      const descending = Comparator.comparingOptionalWith<
        number | undefined,
        number
      >(
        value => value,
        Comparator.of((a, b) => b - a)
      );

      expect(descending.compare(20, 40)).toBeGreaterThan(0);
      expect(descending.compare(40, 20)).toBeLessThan(0);
    });

    it('must order an absent key before a present one using natural order by default', () => {
      const comparator = Comparator.comparingOptionalWith<
        Person | undefined,
        Person
      >(value => value);

      const a = new Person('A', 20);

      expect(comparator.compare(undefined, a)).toBeLessThan(0);
      expect(comparator.compare(a, undefined)).toBeGreaterThan(0);
      expect(comparator.compare(undefined, undefined)).toBe(0);
    });

    it('must compare using natural order by default when both are present', () => {
      const comparator = Comparator.comparingOptionalWith<
        Person | undefined,
        Person
      >(value => value);

      const a = new Person('A', 20);
      const b = new Person('B', 40);

      expect(comparator.compare(a, b)).toBeLessThan(0);
    });
  });

  describe('reversed', () => {
    it('must invert an existing comparator', () => {
      const byName = Comparator.comparingWith<Person, Person>(person => person);
      const byNameDescending = byName.reversed();

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(byNameDescending.compare(young, old)).toBeGreaterThan(0);
      expect(byNameDescending.compare(old, young)).toBeLessThan(0);
    });
  });

  describe('thenComparing', () => {
    it('must fall back to the next comparator when the first ties', () => {
      const bySameLength = Comparator.of<Person>(() => 0);
      const byName = Comparator.of<Person>((a, b) => a.compareTo(b));

      const comparator = bySameLength.thenComparing(byName);

      const a = new Person('A', 20);
      const b = new Person('B', 40);

      expect(comparator.compare(a, b)).toBeLessThan(0);
    });

    it('must not consult the next comparator once the first decides', () => {
      const byName = Comparator.comparingWith<Person, Person>(person => person);
      const alwaysThrows = Comparator.of<Person>(() => {
        throw new Error('must not be called');
      });

      const comparator = byName.thenComparing(alwaysThrows);

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
    });
  });

  describe('thenComparingByWith', () => {
    it('must fall back to comparing by the extracted key using the given comparator', () => {
      const bySameLength = Comparator.of<Person>(() => 0);
      const comparator = bySameLength.thenComparingByWith(
        person => person.age(),
        Comparator.of<number>((a, b) => b - a)
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeGreaterThan(0);
    });

    it('must default to natural order when no comparator is given', () => {
      const bySameLength = Comparator.of<Person>(() => 0);
      const comparator = bySameLength.thenComparingByWith(person => person);

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
    });
  });

  describe('thenComparingByNumber', () => {
    it('must fall back to comparing by the extracted numeric key when the first ties', () => {
      const bySameLength = Comparator.of<Person>(() => 0);
      const comparator = bySameLength.thenComparingByNumber(person =>
        person.age()
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
    });
  });

  describe('thenComparingByString', () => {
    it('must fall back to comparing by the extracted string key when the first ties', () => {
      const bySameLength = Comparator.of<Person>(() => 0);
      const comparator = bySameLength.thenComparingByString(person =>
        person.name()
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
    });
  });

  describe('thenComparingByBoolean', () => {
    it('must fall back to ordering false before true when the first ties', () => {
      const bySameLength = Comparator.of<Person>(() => 0);
      const comparator = bySameLength.thenComparingByBoolean(
        person => person.age() >= 40
      );

      const young = new Person('A', 20);
      const old = new Person('B', 40);

      expect(comparator.compare(young, old)).toBeLessThan(0);
    });
  });

  describe('thenComparingByOptionalWith', () => {
    it('must fall back to comparing using the given comparator when the first ties', () => {
      const bySameLength = Comparator.of<number | undefined>(() => 0);
      const comparator = bySameLength.thenComparingByOptionalWith(
        value => value,
        Comparator.of<number>((a, b) => b - a)
      );

      expect(comparator.compare(undefined, 20)).toBeLessThan(0);
      expect(comparator.compare(20, 40)).toBeGreaterThan(0);
    });

    it('must default to natural order when no comparator is given', () => {
      const bySameLength = Comparator.of<Person | undefined>(() => 0);
      const comparator = bySameLength.thenComparingByOptionalWith(
        value => value
      );

      const a = new Person('A', 20);

      expect(comparator.compare(undefined, a)).toBeLessThan(0);
    });
  });
});
