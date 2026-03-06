import { db } from "./db";
import {
  configurations,
  type Configuration,
  type UpdateConfigurationRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getConfig(): Promise<Configuration>;
  updateConfig(updates: UpdateConfigurationRequest): Promise<Configuration>;
}

export class DatabaseStorage implements IStorage {
  async getConfig(): Promise<Configuration> {
    const [config] = await db.select().from(configurations).limit(1);
    if (!config) {
      // Create default if none exists
      const [newConfig] = await db.insert(configurations).values({}).returning();
      return newConfig;
    }
    return config;
  }

  async updateConfig(updates: UpdateConfigurationRequest): Promise<Configuration> {
    const config = await this.getConfig();
    const [updated] = await db.update(configurations)
      .set(updates)
      .where(eq(configurations.id, config.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
