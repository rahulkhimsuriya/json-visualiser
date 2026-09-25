import React from 'react';
import type { Route } from './+types/data';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DataTableView } from '../../components/dataset/DataTableView';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Data Table View — JSON Visualiser' },
    {
      name: 'description',
      content: 'Explore and filter tabular JSON data with spreadsheet features.',
    },
  ];
}

export default function WorkspaceDataPage() {
  const { activeDataset, settings } = useWorkspace();

  if (!activeDataset) return null;

  return (
    <div className="h-full">
      <DataTableView dataset={activeDataset} settings={settings} />
    </div>
  );
}
