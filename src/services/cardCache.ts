// IndexedDB card & image cache to prevent CDN calls during gameplay (Fortinet DPI safe)

const DB_NAME = 'CommanderZoneCache';
const DB_VERSION = 1;
const STORE_NAME = 'card_images';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

// Memory blob URL cache to avoid re-generating
const memoryBlobUrls = new Map<string, string>();

/**
 * Generate an offline SVG card face if Fortinet blocks external image CDNs
 */
export function generateOfflineCardArt(cardName: string, typeLine = 'Card'): string {
  const safeName = cardName.replace(/[<>&"]/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420" fill="none">
      <rect width="300" height="420" rx="14" fill="#14110b" stroke="#c5a059" stroke-width="4"/>
      <rect x="12" y="12" width="276" height="396" rx="8" fill="#1c1710" stroke="#3d3326" stroke-width="1.5"/>
      <rect x="20" y="20" width="260" height="32" rx="6" fill="#292014" stroke="#c5a059" stroke-width="1"/>
      <text x="28" y="42" fill="#f5f0e6" font-family="serif" font-size="14" font-weight="bold">${safeName.slice(0, 26)}</text>
      <!-- Art Frame -->
      <rect x="20" y="60" width="260" height="180" rx="4" fill="#0d0a07" stroke="#c5a059" stroke-width="1"/>
      <!-- Decorative Symbol -->
      <circle cx="150" cy="150" r="40" stroke="#c5a059" stroke-width="2" fill="#1c1710" opacity="0.6"/>
      <path d="M150 120 C150 135 140 145 125 150 C140 155 150 165 150 180 C150 165 160 155 175 150 C160 145 150 135 150 120 Z" fill="#e5c158"/>
      <!-- Type Line -->
      <rect x="20" y="248" width="260" height="26" rx="4" fill="#292014" stroke="#c5a059" stroke-width="1"/>
      <text x="28" y="266" fill="#c5a059" font-family="sans-serif" font-size="12" font-weight="bold">${typeLine.slice(0, 30)}</text>
      <!-- Text Box -->
      <rect x="20" y="282" width="260" height="118" rx="6" fill="#120e09" stroke="#3d3326" stroke-width="1"/>
      <text x="30" y="310" fill="#a09380" font-family="sans-serif" font-size="11" font-style="italic">Commander Zone Tabletop</text>
      <text x="30" y="330" fill="#f5f0e6" font-family="serif" font-size="12">Spell / Permanent</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Get card image from IndexedDB cache or fetch & cache locally.
 * If blocked by firewall, fallback to offline SVG generation.
 */
export async function getCachedCardImage(cardName: string, externalUrl?: string): Promise<string> {
  const cacheKey = cardName.toLowerCase().trim();

  // 1. Check memory cache
  if (memoryBlobUrls.has(cacheKey)) {
    return memoryBlobUrls.get(cacheKey)!;
  }

  // 2. Check IndexedDB
  try {
    const db = await getDB();
    const blob: Blob | undefined = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cacheKey);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      memoryBlobUrls.set(cacheKey, blobUrl);
      return blobUrl;
    }
  } catch (err) {
    console.warn('IndexedDB read error:', err);
  }

  // 3. If externalUrl provided, try fetching as blob to store in IndexedDB
  if (externalUrl) {
    try {
      const res = await fetch(externalUrl, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        // Save to IndexedDB
        try {
          const db = await getDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(blob, cacheKey);
        } catch (e) {
          console.warn('IndexedDB write error:', e);
        }

        const blobUrl = URL.createObjectURL(blob);
        memoryBlobUrls.set(cacheKey, blobUrl);
        return blobUrl;
      }
    } catch (netErr) {
      console.warn('External image fetch blocked (Fortinet/CORS), using offline art:', netErr);
    }
  }

  // 4. Fallback to offline SVG
  const offlineArt = generateOfflineCardArt(cardName);
  memoryBlobUrls.set(cacheKey, offlineArt);
  return offlineArt;
}
