import React from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { SchemaColumn, DATA_TYPES } from '../../types/types';

interface NestedColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (columns: SchemaColumn[]) => void;
  initialColumns?: SchemaColumn[];
}

const NestedColumnDialog: React.FC<NestedColumnDialogProps> = ({
  open,
  onClose,
  onSave,
  initialColumns = []
}) => {
  const [columns, setColumns] = React.useState<SchemaColumn[]>(initialColumns);
  const [newColumnTitle, setNewColumnTitle] = React.useState('');
  const [newColumnType, setNewColumnType] = React.useState<typeof DATA_TYPES[number]>('string');

  const handleAddNestedColumn = () => {
    if (newColumnTitle) {
      setColumns([
        ...columns,
        {
          title: newColumnTitle,
          order: columns.length,
          dataType: newColumnType
        }
      ]);
      setNewColumnTitle('');
      setNewColumnType('string');
    }
  };

  const handleRemoveNestedColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Define Nested Columns</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Column Title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              size="small"
              fullWidth
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newColumnType}
                label="Type"
                onChange={(e) => setNewColumnType(e.target.value as typeof DATA_TYPES[number])}
              >
                {DATA_TYPES.filter(type => type !== 'object').map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddNestedColumn}
              disabled={!newColumnTitle}
            >
              Add
            </Button>
          </Box>
          
          <List>
            {columns.map((column, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveNestedColumn(index)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={column.title} 
                    secondary={column.dataType} 
                  />
                </ListItem>
                {index < columns.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(columns)}>
          Save Nested Schema
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NestedColumnDialog;