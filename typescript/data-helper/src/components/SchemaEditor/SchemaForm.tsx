import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Save, Add, Send, AutoAwesome } from '@mui/icons-material';
import { ParsedData, Schema, SchemaColumn, DATA_TYPES } from '../../types/types';
import SchemaTable from './SchemaTable';
import NestedColumnDialog from './NestedColumnDialog';
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
  const [newColumnDialog, setNewColumnDialog] = React.useState(false);
  const [nestedColumnDialog, setNestedColumnDialog] = React.useState(false);
  const [editingObjectColumnIndex, setEditingObjectColumnIndex] = React.useState<number | null>(null);
  const [newColumn, setNewColumn] = React.useState({ 
    title: '', 
    dataType: 'string' as typeof DATA_TYPES[number] 
  });
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
    if (newColumn.title) {
      const newColumnData: SchemaColumn = {
        title: newColumn.title,
        order: columns.length,
        dataType: newColumn.dataType
      };

      setColumns([...columns, newColumnData]);

      if (newColumn.dataType === 'object') {
        setEditingObjectColumnIndex(columns.length);
        setNestedColumnDialog(true);
      }

      setNewColumn({ title: '', dataType: 'string' });
      setNewColumnDialog(false);
    }
  };

  const handleColumnDelete = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleEditNestedColumns = (index: number) => {
    setEditingObjectColumnIndex(index);
    setNestedColumnDialog(true);
  };

  const handleNestedColumnsSave = (nestedColumns: SchemaColumn[]) => {
    if (editingObjectColumnIndex !== null) {
      const updatedColumns = [...columns];
      updatedColumns[editingObjectColumnIndex] = {
        ...updatedColumns[editingObjectColumnIndex],
        objectSchema: nestedColumns
      };
      setColumns(updatedColumns);
    }
    setNestedColumnDialog(false);
    setEditingObjectColumnIndex(null);
  };

  const handleSendToEndpoint = async () => {
    if (!editingSchema) return;
  
    try {
      setLoading(true);
      const formData = new FormData();
      const payload = {
        schema: {
          id: editingSchema.id,
          name: editingSchema.name,
          columns: editingSchema.columns
        },
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
          onClick={() => setNewColumnDialog(true)}
        >
          Add Column
        </Button>
      </Box>

      <SchemaTable
        columns={columns}
        onColumnsChange={setColumns}
        onDeleteColumn={handleColumnDelete}
        onEditNestedColumns={handleEditNestedColumns}
      />

      {/* Add Column Dialog */}
      <Dialog open={newColumnDialog} onClose={() => setNewColumnDialog(false)}>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Column Title"
              value={newColumn.title}
              onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Data Type</InputLabel>
              <Select
                value={newColumn.dataType}
                label="Data Type"
                onChange={(e) => setNewColumn({ 
                  ...newColumn, 
                  dataType: e.target.value as typeof DATA_TYPES[number] 
                })}
              >
                {DATA_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewColumnDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddColumn}
            disabled={!newColumn.title}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested Columns Dialog */}
      <NestedColumnDialog
        open={nestedColumnDialog}
        onClose={() => {
          setNestedColumnDialog(false);
          setEditingObjectColumnIndex(null);
        }}
        onSave={handleNestedColumnsSave}
        initialColumns={editingObjectColumnIndex !== null ? 
          columns[editingObjectColumnIndex]?.objectSchema || [] : 
          []
        }
      />
    </Box>
  );
};

export default SchemaForm;