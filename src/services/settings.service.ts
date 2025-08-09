import { Settings, SettingsModel } from '../models/settings.model';

export class SettingsService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private settingsModel: SettingsModel) {}

  async getSetting(id: string): Promise<any> {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached !== null) {
      return cached;
    }

    // Fetch from database
    const setting = await this.settingsModel.findById(id);
    if (!setting) {
      return null;
    }

    // Cache the result
    this.setCache(id, setting.value);
    return setting.value;
  }

  async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    const cacheKey = `category_${category}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch from database
    const settings = await this.settingsModel.findByCategory(category);
    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    // Cache the result
    this.setCache(cacheKey, result);
    return result;
  }

  async updateSetting(id: string, value: any): Promise<void> {
    await this.settingsModel.updateById(id, { value, updated_at: new Date() });
    
    // Invalidate cache
    this.invalidateCache(id);
    this.invalidateCache(`category_${id.split('_')[0]}`);
  }

  async createSetting(setting: Omit<Settings, '_id' | 'created_at' | 'updated_at'>): Promise<Settings> {
    const newSetting = await this.settingsModel.create({
      ...setting,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    // Invalidate cache
    this.invalidateCache(setting.id);
    this.invalidateCache(`category_${setting.category}`);
    
    return newSetting;
  }

  private getFromCache(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key);
    }
    
    // Remove expired cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }
} 