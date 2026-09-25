import React from 'react';
import type { Route } from './+types/schema';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SchemaView } from '../../components/dataset/SchemaView';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Schema Inspector — JSON Visualiser' },
    {
      name: 'description',
      content: 'Inspect field types, nullability, unique counts, and sample values.',
    },
  ];
}

export default function WorkspaceSchemaPage() {
  const { activeDataset } = useWorkspace();

  if (!activeDataset) return null;

  return (
    <div>
      <SchemaView dataset={activeDataset} />
    </div>
  );
}
