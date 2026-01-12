import sqlite3 from 'sqlite3';
import { promisify } from 'util';

let db: sqlite3.Database | null = null;

export async function getDatabase(): Promise<sqlite3.Database> {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./anki.db', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db!);
      }
    });
  });
}

export function initDatabase(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();

    // Créer les tables
    database.serialize(() => {
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS decks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          parent_deck_id TEXT,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (parent_deck_id) REFERENCES decks(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          deck_id TEXT NOT NULL,
          front TEXT NOT NULL,
          back TEXT NOT NULL,
          ease_factor REAL DEFAULT 2.5,
          interval INTEGER DEFAULT 0,
          repetitions INTEGER DEFAULT 0,
          next_review DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (deck_id) REFERENCES decks(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          card_id TEXT NOT NULL,
          quality INTEGER NOT NULL,
          review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          time_spent INTEGER DEFAULT 0,
          FOREIGN KEY (card_id) REFERENCES cards(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS sync_log (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          action TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

// Helper pour exécuter des requêtes
export function runQuery(query: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();
    database.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

export function getQuery(query: string, params: any[] = []): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();
    database.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function allQuery(query: string, params: any[] = []): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();
    database.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}
