import { Persona, Settings, StorageData } from "../types";

export class Storage {
  static async get<K extends keyof StorageData>(
    keys: K[]
  ): Promise<Pick<StorageData, K>> {
    return chrome.storage.local.get(keys) as Promise<Pick<StorageData, K>>;
  }

  static async set(items: Partial<StorageData>): Promise<void> {
    return chrome.storage.local.set(items);
  }

  static async getActivePersona(): Promise<Persona | null> {
    const { activePersonaId, personas } = await this.get([
      "activePersonaId",
      "personas",
    ]);
    if (!activePersonaId || !personas) return null;
    return personas.find((p) => p.id === activePersonaId) || null;
  }

  static generateId(): string {
    return crypto.randomUUID();
  }
}
