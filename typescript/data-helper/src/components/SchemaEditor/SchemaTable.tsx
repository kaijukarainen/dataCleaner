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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
} from '@mui/material';
import { Delete, DragIndicator, ExpandMore, Add } from '@mui/icons-material';
import { SchemaColumn, DATA_TYPES } from '../../types/types';

interface SchemaTableProps {
  columns: SchemaColumn[];
  onColumnsChange: (columns: SchemaColumn[]) => void;
  onDeleteColumn: (index: number) => void;
}

const SchemaTable: React.FC<SchemaTableProps> = ({
  columns,
  onColumnsChange,
  onDeleteColumn,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [editingCell, setEditingCell] = React.useState<{ index: number; value: string } | null>(null);
  const [expandedObjectIndex, setExpandedObjectIndex] = React.useState<number | null>(null);

  const handleDoubleClick = (index: number, value: string) => {
    setEditingCell({ index, value });
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const newColumns = [...columns];
      newColumns[editingCell.index] = {
        ...newColumns[editingCell.index],
        title: editingCell.value || `Column ${editingCell.index + 1}`
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

  const handleAddNestedColumn = (parentIndex: number) => {
    const newColumns = [...columns];
    const parentColumn = newColumns[parentIndex];
    
    if (!parentColumn.objectSchema) {
      parentColumn.objectSchema = [];
    }

    parentColumn.objectSchema.push({
      title: `Field ${parentColumn.objectSchema.length + 1}`,
      order: parentColumn.objectSchema.length,
      dataType: 'string'
    });

    onColumnsChange(newColumns);
  };

  const handleUpdateNestedColumn = (
    parentIndex: number,
    nestedIndex: number,
    updates: Partial<SchemaColumn>
  ) => {
    const newColumns = [...columns];
    const parentColumn = newColumns[parentIndex];
    
    if (parentColumn.objectSchema) {
      parentColumn.objectSchema[nestedIndex] = {
        ...parentColumn.objectSchema[nestedIndex],
        ...updates
      };
      onColumnsChange(newColumns);
    }
  };

  const handleDeleteNestedColumn = (parentIndex: number, nestedIndex: number) => {
    const newColumns = [...columns];
    const parentColumn = newColumns[parentIndex];
    
    if (parentColumn.objectSchema) {
      parentColumn.objectSchema = parentColumn.objectSchema.filter((_, i) => i !== nestedIndex);
      onColumnsChange(newColumns);
    }
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
            <React.Fragment key={index}>
              <TableRow
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
                        const newType = e.target.value as typeof DATA_TYPES[number];
                        newColumns[index] = {
                          ...newColumns[index],
                          dataType: newType,
                          objectSchema: newType === 'object' ? [] : undefined
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
                  <Tooltip title="Delete Column">
                    <IconButton 
                      onClick={() => onDeleteColumn(index)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
              {column.dataType === 'object' && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 0, borderBottom: 'none' }}>
                    <Accordion
                      expanded={expandedObjectIndex === index}
                      onChange={() => setExpandedObjectIndex(expandedObjectIndex === index ? null : index)}
                      sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">
                          Object Fields ({column.objectSchema?.length || 0})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                          <Button
                            startIcon={<Add />}
                            size="small"
                            onClick={() => handleAddNestedColumn(index)}
                          >
                            Add Field
                          </Button>
                        </Box>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Field Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell width="50px">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {column.objectSchema?.map((nestedColumn, nestedIndex) => (
                              <TableRow key={nestedIndex}>
                                <TableCell>
                                  <TextField
                                    value={nestedColumn.title}
                                    onChange={(e) => handleUpdateNestedColumn(
                                      index,
                                      nestedIndex,
                                      { title: e.target.value }
                                    )}
                                    size="small"
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={nestedColumn.dataType}
                                      onChange={(e) => handleUpdateNestedColumn(
                                        index,
                                        nestedIndex,
                                        { dataType: e.target.value as typeof DATA_TYPES[number] }
                                      )}
                                    >
                                      {DATA_TYPES.filter(type => type !== 'object').map((type) => (
                                        <MenuItem key={type} value={type}>
                                          {type}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteNestedColumn(index, nestedIndex)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SchemaTable;