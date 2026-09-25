import React from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/import';
import { JsonInputView } from '../components/json-input/JsonInputView';
import { useWorkspace } from '../context/WorkspaceContext';
import type { Dataset } from '../types/dataset';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Import JSON — JSON Visualiser' },
    {
      name: 'description',
      content: 'Paste, upload, or drag-and-drop JSON files for local in-browser analysis.',
    },
  ];
}

export default function ImportPage() {
  const { addDataset, datasets } = useWorkspace();
  const navigate = useNavigate();

  const handleDatasetCreated = async (dataset: Dataset) => {
    await addDataset(dataset);
    navigate('/workspace/data');
  };

  const handleCancel = () => {
    if (datasets.length > 0) {
      navigate('/workspace/data');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 lg:py-6 space-y-4">
      <JsonInputView
        onDatasetCreated={handleDatasetCreated}
        onCancel={handleCancel}
        canCancel={true}
      />
    </div>
  );
}
