
"use client";

import PouchDB from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";

// Extend PouchDB with the find plugin
if (typeof window !== "undefined") {
  PouchDB.plugin(PouchDBFind);
}

export interface VaultItem {
  _id: string;
  _rev?: string;
  userId: string;
  type: "note" | "password" | "link";
  title: string;
  encryptedContent: string;
  createdAt: string;
  updatedAt: string;
}

export class PouchDBService {
  private static localDB: PouchDB.Database | null = null;
  private static remoteDB: PouchDB.Database | null = null;
  private static syncHandler: PouchDB.Replication.Sync<{}> | null = null;

  static async initialize(userId: string): Promise<void> {
    if (typeof window === "undefined") return;

    // Initialize local database
    this.localDB = new PouchDB(`securenotes_${userId}`);

    // Initialize remote database with CouchDB
    const couchDBUrl = "https://admin:SecurePass123!@securenotes-couchdb.fly.dev";
    this.remoteDB = new PouchDB(`${couchDBUrl}/securenotes`);

    // Create index for userId
    try {
      await this.localDB.createIndex({
        index: { fields: ["userId"] },
      });
    } catch (error) {
      console.error("Error creating index:", error);
    }

    // Set up bidirectional sync with filtering
    this.syncHandler = this.localDB
      .sync(this.remoteDB, {
        live: true,
        retry: true,
        filter: (doc: any) => {
          // Only sync documents for this user
          return doc.userId === userId;
        },
      })
      .on("change", (info) => {
        console.log("Sync change:", info);
      })
      .on("error", (err) => {
        console.error("Sync error:", err);
      });
  }

  static async addItem(item: Omit<VaultItem, "_id" | "createdAt" | "updatedAt">): Promise<VaultItem> {
    if (!this.localDB) throw new Error("Database not initialized");

    const now = new Date().toISOString();
    const newItem: VaultItem = {
      ...item,
      _id: `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    await this.localDB.put(newItem);
    return newItem;
  }

  static async updateItem(item: VaultItem): Promise<void> {
    if (!this.localDB) throw new Error("Database not initialized");

    const updatedItem = {
      ...item,
      updatedAt: new Date().toISOString(),
    };

    await this.localDB.put(updatedItem);
  }

  static async deleteItem(id: string, rev: string): Promise<void> {
    if (!this.localDB) throw new Error("Database not initialized");
    await this.localDB.remove(id, rev);
  }

  static async getItems(userId: string, type?: "note" | "password" | "link"): Promise<VaultItem[]> {
    if (!this.localDB) throw new Error("Database not initialized");

    const selector: any = { userId };
    if (type) {
      selector.type = type;
    }

    const result = await this.localDB.find({
      selector,
      sort: [{ updatedAt: "desc" }],
    });

    return result.docs as VaultItem[];
  }

  static async searchItems(userId: string, query: string): Promise<VaultItem[]> {
    if (!this.localDB) throw new Error("Database not initialized");

    const allItems = await this.getItems(userId);
    
    // Search in titles (content is encrypted, so we can't search that)
    return allItems.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  static destroy(): void {
    if (this.syncHandler) {
      this.syncHandler.cancel();
      this.syncHandler = null;
    }
    this.localDB = null;
    this.remoteDB = null;
  }
}
