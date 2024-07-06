export class GenericMap<K> {
  private readonly map: Map<K, any>;

  constructor() {
    this.map = new Map<K, any>();
  }

  get<V>(key: K): V | undefined {
    return this.map.get(key);
  }

  getOrDefault<V>(key: K, defaultValue: V): V {
    return this.map.get(key) ?? defaultValue;
  }

  getOrSet<V>(key: K, value: V): V {
    if (!this.map.has(key)) {
      this.map.set(key, value);
    }

    return this.map.get(key);
  }

  set(key: K, value: any): this {
    this.map.set(key, value);
    return this;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  forEach(callbackfn: (value: any, key: K, map: GenericMap<K>) => void): void {
    this.map.forEach((value, key) => {
      callbackfn(value, key, this);
    });
  }

  get size(): number {
    return this.map.size;
  }
}
