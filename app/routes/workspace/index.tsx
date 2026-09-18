import React from 'react';
import { Navigate } from 'react-router';

export default function WorkspaceIndex() {
  return <Navigate to="/workspace/data" replace />;
}
