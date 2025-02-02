import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  useTheme,
  Button
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { Schema } from '../../types/types';

interface SavedSchemasProps {
  schemas: Schema[];
  setSchemas: (schemas: Schema[]) => void;
  editingSchema: Schema | null;
  setEditingSchema: (schema: Schema | null) => void;
  onNewSchema: () => void;
}

const SavedSchemas: React.FC<SavedSchemasProps> = ({
  schemas,
  setSchemas,
  editingSchema,
  setEditingSchema,
  onNewSchema
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Saved Schemas
        </Typography>
        <Button
          startIcon={<Add />}
          onClick={onNewSchema}
          variant="outlined"
          size="small"
        >
          New Schema
        </Button>
      </Box>

      <List>
        {schemas.map((schema) => (
          <ListItemButton
            key={schema.id}
            selected={schema.id === editingSchema?.id}
            onClick={() => setEditingSchema(schema)}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
              }
            }}
          >
            <ListItemText
              primary={schema.name}
              secondary={`${schema.columns.length} columns`}
            />
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setSchemas(schemas.filter(s => s.id !== schema.id));
                if (schema.id === editingSchema?.id) {
                  onNewSchema();
                }
              }}
              color="error"
            >
              <Delete />
            </IconButton>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default SavedSchemas;