import React from 'react';
import { Box } from '@mui/material';
import { Schema, ParsedData } from '../../types/types';
import SavedSchemas from './SavedSchemas';
import SchemaForm from './SchemaForm';

interface SchemaEditorProps {
  data: ParsedData; // Keep data for API requests
  schemas: Schema[];
  setSchemas: (schemas: Schema[]) => void;
  onPreviewData: (data: any) => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  data,
  schemas,
  setSchemas,
  onPreviewData,
  onError,
  setLoading
}) => {
  const [editingSchema, setEditingSchema] = React.useState<Schema | null>(null);

  const handleNewSchema = () => {
    setEditingSchema(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <SchemaForm
        data={data} // Pass data to SchemaForm for API requests
        schemas={schemas}
        setSchemas={setSchemas}
        editingSchema={editingSchema}
        setEditingSchema={setEditingSchema}
        onPreviewData={onPreviewData}
        onError={onError}
        setLoading={setLoading}
      />
      
      <SavedSchemas
        schemas={schemas}
        setSchemas={setSchemas}
        editingSchema={editingSchema}
        setEditingSchema={setEditingSchema}
        onNewSchema={handleNewSchema}
      />
    </Box>
  );
};

export default SchemaEditor;