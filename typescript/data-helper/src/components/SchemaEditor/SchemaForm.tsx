import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { Save, Add, Send, AutoAwesome } from '@mui/icons-material';
import { ParsedData, Schema, SchemaColumn } from '../../types/types';
import SchemaTable from './SchemaTable';
import { usePreviewData } from 'hooks/usePreviewData';

interface SchemaFormProps {
  data: ParsedData;
  schemas: Schema[];
  setSchemas: (schemas: Schema[]) => void;
  editingSchema: Schema | null;
  setEditingSchema: (schema: Schema | null) => void;
  onPreviewData: (data: any) => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

const SchemaForm: React.FC<SchemaFormProps> = ({
  data,
  schemas,
  setSchemas,
  editingSchema,
  setEditingSchema,
  onPreviewData,
  onError,
  setLoading
}) => {
  const [schemaName, setSchemaName] = React.useState('');
  const [columns, setColumns] = React.useState<SchemaColumn[]>([]);
  const { setPreviewData } = usePreviewData();

  React.useEffect(() => {
    if (editingSchema) {
      setColumns(editingSchema.columns);
      setSchemaName(editingSchema.name);
    } else {
      setSchemaName('');
      setColumns([]);
    }
  }, [editingSchema]);

  const handleSave = () => {
    const updatedColumns = columns.map((col, index) => ({
      ...col,
      order: index,
    }));

    const schemaToSave: Schema = {
      id: editingSchema?.id || Date.now().toString(),
      name: schemaName,
      columns: updatedColumns
    };

    if (editingSchema) {
      setSchemas(schemas.map(s => s.id === editingSchema.id ? schemaToSave : s));
    } else {
      setSchemas([...schemas, schemaToSave]);
    }

    setEditingSchema(schemaToSave);
  };

  const handleAddColumn = () => {
    const newColumnData: SchemaColumn = {
      title: `Column ${columns.length + 1}`,
      order: columns.length,
      dataType: 'string'
    };

    setColumns([...columns, newColumnData]);
  };

  const handleColumnDelete = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSendToEndpoint = async () => {
    if (!editingSchema) return;
  
    try {
      setLoading(true);
      const formData = new FormData();
      const payload = {
        schema: editingSchema,
        data: data
      };
      formData.append('request', JSON.stringify(payload));
  
      const response = await fetch('http://localhost:8080/api/map-schema', {
        method: 'POST',
        body: formData
      });
  
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(responseText || `Server responded with status: ${response.status}`);
      }
      
      try {
        const result = JSON.parse(responseText);
        setPreviewData(result);
        onPreviewData(result);
      } catch (e) {
        onError(responseText);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('request', JSON.stringify({ data }));
  
      const response = await fetch('http://localhost:8080/api/parse-data', {
        method: 'POST',
        body: formData
      });
  
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || `Server responded with status: ${response.status}`);
      }
  
      try {
        const result = JSON.parse(responseText);
        setPreviewData(result);
        onPreviewData(result);
      } catch (e) {
        onError(responseText);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {editingSchema ? `Edit Schema: ${editingSchema.name}` : 'Create New Schema'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Schema Name"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<Save />}
          disabled={!schemaName || columns.length === 0}
        >
          {editingSchema ? 'Update Schema' : 'Save Schema'}
        </Button>
        {editingSchema && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Send />}
            onClick={handleSendToEndpoint}
          >
            Send Schema
          </Button>
        )}
        <Button
          variant="contained"
          color="info"
          startIcon={<AutoAwesome />}
          onClick={handleAIGenerate}
        >
           AI Generate
        </Button>
        <Button
          startIcon={<Add />}
          onClick={handleAddColumn}
        >
          Add Column
        </Button>
      </Box>

      <SchemaTable
        columns={columns}
        onColumnsChange={setColumns}
        onDeleteColumn={handleColumnDelete}
      />
    </Box>
  );
};

export default SchemaForm;