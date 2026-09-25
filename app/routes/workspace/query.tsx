import React from 'react';
import { useOutletContext, useLocation } from 'react-router';
import type { Route } from './+types/query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { QueryView } from '../../components/query/QueryView';
import type { QueryResult } from '../../types/query';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'SQL Query Studio — JSON Visualiser' },
    { name: 'description', content: 'Query JSON datasets locally with AlaSQL.' },
  ];
}

interface OutletContextType {
  onSetQueryResult: (result: QueryResult | null) => void;
  onOpenExport: () => void;
}

export default function WorkspaceQueryPage() {
  const {
    datasets,
    activeDatasetId,
    queryHistory,
    savedQueries,
    addQueryHistory,
    clearQueryHistory,
    deleteQueryHistory,
    saveQuery,
    updateSavedQuery,
    deleteSavedQuery,
    duplicateSavedQuery,
  } = useWorkspace();

  const { onOpenExport } = useOutletContext<OutletContextType>();
  const location = useLocation();
  const initialSql = (location.state as any)?.initialSql;

  return (
    <div>
      <QueryView
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        history={queryHistory}
        savedQueries={savedQueries}
        onAddHistoryItem={addQueryHistory}
        onClearHistory={clearQueryHistory}
        onDeleteHistoryItem={deleteQueryHistory}
        onSaveQuery={saveQuery}
        onUpdateSavedQuery={updateSavedQuery}
        onDeleteSavedQuery={deleteSavedQuery}
        onDuplicateSavedQuery={duplicateSavedQuery}
        onOpenExportModal={onOpenExport}
        initialSql={initialSql}
      />
    </div>
  );
}
