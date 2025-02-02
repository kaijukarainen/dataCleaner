import React from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Box,
} from '@mui/material';
import { Delete, DragIndicator, Edit } from '@mui/icons-material';
import { SchemaColumn, DATA_TYPES } from '../../types/types';

interface SchemaTableProps {
  columns: SchemaColumn[];
  onColumnsChange: (columns: SchemaColumn[]) => void;
  onDeleteColumn: (index: number) => void;
  onEditNestedColumns: (index: number) => void;
}

const SchemaTable: React.FC<SchemaTableProps> = ({
  columns,
  onColumnsChange,
  onDeleteColumn,
  onEditNestedColumns,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [editingCell, setEditingCell] = React.useState<{ index: number; value: string } | null>(null);

  const handleDoubleClick = (index: number, value: string) => {
    setEditingCell({ index, value });
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const newColumns = [...columns];
      newColumns[editingCell.index] = {
        ...newColumns[editingCell.index],
        title: editingCell.value
      };
      onColumnsChange(newColumns);
      setEditingCell(null);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newColumns = [...columns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);
    
    onColumnsChange(newColumns);
    setDraggedIndex(index);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="50px"></TableCell>
            <TableCell>Column Title</TableCell>
            <TableCell>Data Type</TableCell>
            <TableCell width="100px">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {columns.map((column, index) => (
            <TableRow
              key={column.title + index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              sx={{ 
                cursor: 'move',
                bgcolor: draggedIndex === index ? 'action.hover' : 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <TableCell>
                <DragIndicator />
              </TableCell>
              <TableCell onDoubleClick={() => handleDoubleClick(index, column.title)}>
                {editingCell?.index === index ? (
                  <TextField
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    onBlur={handleCellBlur}
                    autoFocus
                    size="small"
                    fullWidth
                  />
                ) : (
                  column.title
                )}
              </TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <Select
                    value={column.dataType}
                    onChange={(e) => {
                      const newColumns = [...columns];
                      newColumns[index] = {
                        ...newColumns[index],
                        dataType: e.target.value as typeof DATA_TYPES[number]
                      };
                      onColumnsChange(newColumns);
                    }}
                  >
                    {DATA_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {column.dataType === 'object' && (
                    <Tooltip title="Edit Nested Schema">
                      <IconButton
                        onClick={() => onEditNestedColumns(index)}
                        size="small"
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete Column">
                    <IconButton 
                      onClick={() => onDeleteColumn(index)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SchemaTable;