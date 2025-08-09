import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';

export interface Settings {
  _id?: ObjectId;
  id: string;
  category: string;
  key: string;
  value: any;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SettingsModel {
  private fi: FastifyInstance;

  constructor(fi: FastifyInstance) {
    this.fi = fi;
  }

  private collection() {
    return this.fi.mongo.db!.collection<Settings>('settings');
  }

  async findById(id: string): Promise<Settings | null> {
    return this.collection().findOne({ id }) as Promise<Settings | null>;
  }

  async findByCategory(category: string): Promise<Settings[]> {
    return this.collection().find({ category }).toArray() as Promise<Settings[]>;
  }

  async updateById(id: string, settings: Partial<Settings>): Promise<void> {
    const updateData = {
      ...settings,
      updated_at: new Date(),
    };
    
    await this.collection().updateOne(
      { id },
      { $set: updateData }
    );
  }

  async create(settings: Settings): Promise<Settings> {
    const now = new Date();
    const newSettings: Settings = {
      ...settings,
      created_at: now,
      updated_at: now,
    };

    const result = await this.collection().insertOne(newSettings);
    return {
      ...newSettings,
      _id: result.insertedId,
    };
  }

  async deleteById(id: string): Promise<void> {
    await this.collection().deleteOne({ id });
  }
}

declare module "fastify" {
  interface FastifyInstance {
    settingsModel: SettingsModel;
  }
} 