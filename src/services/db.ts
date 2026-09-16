import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface GameDB extends DBSchema {
  cards: {
    key: string;
    value: {
      id: string; // usually scryfall id or custom id
      blob: Blob;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<GameDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<GameDB>('mtg-simulator-db', 1, {
      upgrade(db) {
        db.createObjectStore('cards', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const saveCardImage = async (id: string, blob: Blob) => {
  const db = await initDB();
  await db.put('cards', { id, blob });
};

export const getCardImage = async (id: string): Promise<string | null> => {
  const db = await initDB();
  const card = await db.get('cards', id);
  if (card && card.blob) {
    return URL.createObjectURL(card.blob);
  }
  return null;
};
