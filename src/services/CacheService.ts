export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { value: unknown; timestamp: number }>;
  private readonly TTL: number;

  private constructor(ttl: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.TTL = ttl;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  public clear(): void {
    this.cache.clear();
  }

  public remove(key: string): void {
    this.cache.delete(key);
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
} 