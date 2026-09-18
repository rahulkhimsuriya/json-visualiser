import { get, set, del, keys, createStore, clear, type UseStore } from 'idb-keyval';
import type { Dataset } from '../types/dataset';
import type { QueryHistoryItem, SavedQuery } from '../types/query';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';

const STORAGE_KEYS = {
  SETTINGS: 'json_vis_settings',
  SAVED_QUERIES: 'json_vis_saved_queries',
  QUERY_HISTORY: 'json_vis_query_history',
  ACTIVE_DATASET_ID: 'json_vis_active_dataset_id',
  DATASET_INDEX: 'json_vis_dataset_index', // Array of dataset IDs in order
  IDB_PREFIX: 'dataset_',
  IDB_DB_NAME: 'JsonVisualiserStudioDb',
  IDB_STORE_NAME: 'JsonVisualiserStudio',
};

let studioStoreInstance: UseStore | undefined;

export function getStudioStore(): UseStore | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!studioStoreInstance) {
    studioStoreInstance = createStore(STORAGE_KEYS.IDB_DB_NAME, STORAGE_KEYS.IDB_STORE_NAME);
  }
  return studioStoreInstance;
}

export const studioStore: UseStore = (txMode, callback) => {
  const store = getStudioStore();
  if (!store) {
    return Promise.reject(new Error('IndexedDB store is only available in browser environment'));
  }
  return store(txMode, callback);
};

/**
 * Settings
 */
export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

/**
 * Saved Queries
 */
export function loadSavedQueries(): SavedQuery[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveSavedQueries(queries: SavedQuery[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(queries));
  } catch (e) {
    console.warn('Failed to save queries to localStorage', e);
  }
}

/**
 * Query History
 */
export function loadQueryHistory(): QueryHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUERY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveQueryHistory(history: QueryHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep maximum 100 recent items
    const trimmed = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save query history to localStorage', e);
  }
}

/**
 * Datasets (IndexedDB)
 */
export async function loadDatasetsFromStorage(): Promise<{ datasets: Dataset[]; activeId: string | null }> {
  if (typeof window === 'undefined') return { datasets: [], activeId: null };

  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DATASET_ID);
    const indexRaw = localStorage.getItem(STORAGE_KEYS.DATASET_INDEX);
    const datasetIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    const store = getStudioStore();

    const loadedDatasets: Dataset[] = [];
    for (const id of datasetIds) {
      try {
        let ds = await get<Dataset>(`${STORAGE_KEYS.IDB_PREFIX}${id}`, store);
        // Fallback / migration from default store if needed
        if (!ds) {
          ds = await get<Dataset>(`${STORAGE_KEYS.IDB_PREFIX}${id}`);
          if (ds && store) {
            await set(`${STORAGE_KEYS.IDB_PREFIX}${id}`, ds, store);
          }
        }
        if (ds) {
          loadedDatasets.push(ds);
        }
      } catch (err) {
        console.warn(`Could not load dataset ${id} from IndexedDB`, err);
      }
    }

    return {
      datasets: loadedDatasets,
      activeId: activeId && loadedDatasets.some((d) => d.id === activeId) ? activeId : loadedDatasets[0]?.id || null,
    };
  } catch (err) {
    console.error('Failed to load datasets from IndexedDB', err);
    return { datasets: [], activeId: null };
  }
}

export async function saveDatasetToStorage(dataset: Dataset): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Save dataset object in custom IndexedDB store
    const store = getStudioStore();
    await set(`${STORAGE_KEYS.IDB_PREFIX}${dataset.id}`, dataset, store);

    // Update index in localStorage
    const indexRaw = localStorage.getItem(STORAGE_KEYS.DATASET_INDEX);
    const datasetIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!datasetIds.includes(dataset.id)) {
      datasetIds.push(dataset.id);
      localStorage.setItem(STORAGE_KEYS.DATASET_INDEX, JSON.stringify(datasetIds));
    }
  } catch (err) {
    console.error('Failed to save dataset to IndexedDB', err);
  }
}

export async function deleteDatasetFromStorage(datasetId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const store = getStudioStore();
    await del(`${STORAGE_KEYS.IDB_PREFIX}${datasetId}`, store);
    // Also cleanup legacy store if present
    try {
      await del(`${STORAGE_KEYS.IDB_PREFIX}${datasetId}`);
    } catch (_) {}

    const indexRaw = localStorage.getItem(STORAGE_KEYS.DATASET_INDEX);
    const datasetIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    const filtered = datasetIds.filter((id) => id !== datasetId);
    localStorage.setItem(STORAGE_KEYS.DATASET_INDEX, JSON.stringify(filtered));

    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DATASET_ID);
    if (activeId === datasetId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DATASET_ID, filtered[0] || '');
    }
  } catch (err) {
    console.error('Failed to delete dataset from IndexedDB', err);
  }
}

export function saveActiveDatasetId(activeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DATASET_ID, activeId);
  } catch (e) {
    // ignore
  }
}

/**
 * Storage metrics & clear
 */
export async function getStorageUsageEstimate(): Promise<{ localStorageKb: number; indexedDbKb: number; totalKb: number }> {
  if (typeof window === 'undefined') return { localStorageKb: 0, indexedDbKb: 0, totalKb: 0 };

  let lsBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('json_vis_')) {
      const val = localStorage.getItem(k) || '';
      lsBytes += k.length + val.length;
    }
  }

  let idbBytes = 0;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      idbBytes = estimate.usage || 0;
    }
  } catch (e) {
    // ignore
  }

  const localStorageKb = Math.round(lsBytes / 1024);
  const indexedDbKb = Math.round(idbBytes / 1024);

  return {
    localStorageKb,
    indexedDbKb,
    totalKb: localStorageKb + indexedDbKb,
  };
}

export async function clearAllLocalData(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear localStorage keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith('json_vis_')) {
      localStorage.removeItem(k);
    }
  }

  // Clear custom IndexedDB store
  try {
    const store = getStudioStore();
    if (store) {
      await clear(store);
    }
  } catch (err) {
    console.warn('Failed to clear custom IndexedDB store', err);
  }

  // Clear legacy default IndexedDB keys
  try {
    const allKeys = await keys();
    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith(STORAGE_KEYS.IDB_PREFIX)) {
        await del(key);
      }
    }
  } catch (err) {
    console.warn('Failed to clear legacy IndexedDB completely', err);
  }
}
