import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Dataset, FieldType } from '../types/dataset';
import type { QueryHistoryItem, SavedQuery } from '../types/query';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';
import {
  loadDatasetsFromStorage,
  saveDatasetToStorage,
  deleteDatasetFromStorage,
  saveActiveDatasetId,
  loadQueryHistory,
  saveQueryHistory,
  loadSavedQueries,
  saveSavedQueries,
  loadSettings,
  saveSettings,
  clearAllLocalData,
} from '../lib/storage';
import { processJsonToDataset } from '../lib/json-processor';
import { type SampleDatasetPreset } from '../lib/sample-data';

interface WorkspaceContextType {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string) => void;
  addDataset: (ds: Dataset) => Promise<void>;
  updateColumnType: (datasetId: string, columnKey: string, newType: FieldType) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  loadPresetDataset: (preset: SampleDatasetPreset) => Promise<Dataset>;
  queryHistory: QueryHistoryItem[];
  addQueryHistory: (item: QueryHistoryItem) => void;
  clearQueryHistory: () => void;
  deleteQueryHistory: (id: string) => void;
  savedQueries: SavedQuery[];
  saveQuery: (name: string, sql: string) => void;
  updateSavedQuery: (query: SavedQuery) => void;
  deleteSavedQuery: (id: string) => void;
  duplicateSavedQuery: (query: SavedQuery) => void;
  clearSavedQueries: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  resetSettings: () => void;
  clearAllData: () => Promise<void>;
  isInitialized: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetIdState] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const init = async () => {
      const storedSettings = loadSettings();
      setSettings(storedSettings);

      setQueryHistory(loadQueryHistory());
      setSavedQueries(loadSavedQueries());

      const { datasets: loadedDatasets, activeId } = await loadDatasetsFromStorage();
      setDatasets(loadedDatasets);
      setActiveDatasetIdState(activeId);
      setIsInitialized(true);
    };

    init();
  }, []);

  // Theme synchronization
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const setActiveDatasetId = (id: string) => {
    setActiveDatasetIdState(id);
    saveActiveDatasetId(id);
  };

  const addDataset = async (newDataset: Dataset) => {
    await saveDatasetToStorage(newDataset);
    saveActiveDatasetId(newDataset.id);

    setDatasets((prev) => {
      const filtered = prev.filter((d) => d.id !== newDataset.id);
      return [newDataset, ...filtered];
    });
    setActiveDatasetIdState(newDataset.id);
  };

  const updateColumnType = async (datasetId: string, columnKey: string, newType: FieldType) => {
    let targetDs: Dataset | null = null;
    setDatasets((prev) =>
      prev.map((ds) => {
        if (ds.id !== datasetId) return ds;
        const updatedColumns = ds.columns.map((col) =>
          col.key === columnKey ? { ...col, type: newType } : col
        );
        targetDs = { ...ds, columns: updatedColumns };
        return targetDs;
      })
    );
    if (targetDs) {
      await saveDatasetToStorage(targetDs);
    }
  };

  const deleteDataset = async (id: string) => {
    await deleteDatasetFromStorage(id);
    const remaining = datasets.filter((d) => d.id !== id);
    setDatasets(remaining);
    const newActiveId = remaining[0]?.id || null;
    setActiveDatasetIdState(newActiveId);
    if (newActiveId) {
      saveActiveDatasetId(newActiveId);
    }
  };

  const loadPresetDataset = async (preset: SampleDatasetPreset): Promise<Dataset> => {
    const rawJson = JSON.stringify(preset.data, null, 2);
    const ds = await processJsonToDataset(rawJson, preset.filename);
    await addDataset(ds);
    return ds;
  };

  const addQueryHistory = (item: QueryHistoryItem) => {
    const updated = [item, ...queryHistory.slice(0, 99)];
    setQueryHistory(updated);
    saveQueryHistory(updated);
  };

  const clearQueryHistory = () => {
    setQueryHistory([]);
    saveQueryHistory([]);
  };

  const deleteQueryHistory = (id: string) => {
    const updated = queryHistory.filter((h) => h.id !== id);
    setQueryHistory(updated);
    saveQueryHistory(updated);
  };

  const saveQuery = (name: string, sql: string) => {
    const newSaved: SavedQuery = {
      id: `saved_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      sql,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newSaved, ...savedQueries];
    setSavedQueries(updated);
    saveSavedQueries(updated);
  };

  const updateSavedQuery = (query: SavedQuery) => {
    const updated = savedQueries.map((q) => (q.id === query.id ? query : q));
    setSavedQueries(updated);
    saveSavedQueries(updated);
  };

  const deleteSavedQuery = (id: string) => {
    const updated = savedQueries.filter((q) => q.id !== id);
    setSavedQueries(updated);
    saveSavedQueries(updated);
  };

  const duplicateSavedQuery = (query: SavedQuery) => {
    const duplicated: SavedQuery = {
      ...query,
      id: `saved_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${query.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [duplicated, ...savedQueries];
    setSavedQueries(updated);
    saveSavedQueries(updated);
  };

  const clearSavedQueries = () => {
    setSavedQueries([]);
    saveSavedQueries([]);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  const clearAllData = async () => {
    await clearAllLocalData();
    setDatasets([]);
    setActiveDatasetIdState(null);
    setQueryHistory([]);
    setSavedQueries([]);
    setSettings(DEFAULT_SETTINGS);
  };

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0] || null;

  return (
    <WorkspaceContext.Provider
      value={{
        datasets,
        activeDataset,
        activeDatasetId,
        setActiveDatasetId,
        addDataset,
        updateColumnType,
        deleteDataset,
        loadPresetDataset,
        queryHistory,
        addQueryHistory,
        clearQueryHistory,
        deleteQueryHistory,
        savedQueries,
        saveQuery,
        updateSavedQuery,
        deleteSavedQuery,
        duplicateSavedQuery,
        clearSavedQueries,
        settings,
        updateSettings,
        resetSettings,
        clearAllData,
        isInitialized,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
