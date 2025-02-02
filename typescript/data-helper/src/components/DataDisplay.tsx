import React from 'react';
import { 
  Paper, 
  Box, 
  Tab, 
  Tabs,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ParsedData, Schema, SchemaColumn } from '../types/types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePreviewData } from '../hooks/usePreviewData';
import SchemaEditor from './SchemaEditor/SchemaEditor';
import JsonPreview from './JsonPreview';

interface DataDisplayProps {
  data: ParsedData;
  loading: boolean;
}

const LoadingOverlay = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 2 }}>
      This may take a little while...
    </Typography>
  </Box>
);

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  error: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, onClose, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Error</DialogTitle>
    <DialogContent>
      <Typography>{error}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const DataDisplay: React.FC<DataDisplayProps> = ({ data, loading: fileLoading }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  const { 
    previewData,
    setPreviewData,
    isLoading: previewLoading,
    clearPreviewData
  } = usePreviewData();

  const [schemas, setSchemas] = useLocalStorage<Schema[]>(
    'schemas',
    [],
    (storedSchemas: Schema[]) => storedSchemas.map((schema: Schema) => ({
      ...schema,
      columns: schema.columns.map((column: SchemaColumn) => ({
        ...column,
        dataType: column.dataType || 'string'
      }))
    }))
  );

  // Parse JSON response handling code blocks
  const parseJsonResponse = (response: string) => {
    try {
      if (response.startsWith('```json') && response.endsWith('```')) {
        const jsonStr = response.slice(7, -3).trim();
        return JSON.parse(jsonStr);
      }
      return JSON.parse(response);
    } catch (e) {
      throw new Error('Failed to parse server response');
    }
  };

  const handleError = (errorMessage: string) => {
    try {
      const parsedData = parseJsonResponse(errorMessage);
      handlePreviewData(parsedData);
    } catch (e) {
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePreviewData = (data: any) => {
    setPreviewData(data);  // Save to localStorage via hook
    setTabValue(3);        // Switch to preview tab
    setLoading(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 3 && !previewData) {
      // Try to load preview data when switching to preview tab
      const storedData = localStorage.getItem('document-parser-preview-data');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setPreviewData(parsedData);
        } catch (e) {
          console.error('Failed to parse stored preview data:', e);
        }
      }
    }
  };

  // Configure DataGrid columns
  const formDataColumns = [
    { field: 'key', headerName: 'Key', flex: 1, editable: true },
    { field: 'value', headerName: 'Value', flex: 2, editable: true },
  ];

  const formDataRows = data.formData.map((item, index) => ({
    id: index,
    ...item,
  }));

  return (
    <>
      <ErrorDialog 
        open={!!error} 
        onClose={() => setError(null)} 
        error={error || ''} 
      />
      <Paper 
        sx={{
          p: 3,
          mt: 3,
          boxShadow: theme.shadows[2],
          borderRadius: theme.shape.borderRadius,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 400,
          height: 'auto',
          position: 'relative'
        }}
      >
        {(loading || fileLoading) && <LoadingOverlay />}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
          >
            <Tab label="Form Data" />
            <Tab label="Raw Data" />
            <Tab label="Schema Editor" />
            <Tab 
              label="Preview" 
              sx={{
                position: 'relative',
                '&::after': previewData ? {
                  content: '""',
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  top: '4px',
                  right: '4px'
                } : {}
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {tabValue === 0 && (
            <Box sx={{ flex: 1, minHeight: 400 }}>
              <DataGrid
                rows={formDataRows}
                columns={formDataColumns}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  '& .MuiDataGrid-cell': {
                    fontSize: theme.typography.body2.fontSize,
                  },
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: theme.palette.grey[100],
                    fontWeight: theme.typography.fontWeightBold,
                  },
                  '& .MuiDataGrid-main': {
                    maxHeight: 'none !important'
                  }
                }}
              />
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box sx={{
              flex: 1,
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: theme.shape.borderRadius,
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word'
              }}>
                {data.rawData}
              </pre>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box sx={{ flex: 1 }}>
              <SchemaEditor
                data={data}
                schemas={schemas}
                setSchemas={setSchemas}
                onPreviewData={handlePreviewData}
                onError={handleError}
                setLoading={setLoading}
              />
            </Box>
          )}
          
          {tabValue === 3 && (
            <Box sx={{ flex: 1, minHeight: 400 }}>
              {previewLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 400 
                }}>
                  <CircularProgress />
                </Box>
              ) : !previewData ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 400 
                }}>
                  <Typography color="text.secondary">
                    No preview data available
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => setTabValue(2)}
                  >
                    Generate Preview Data
                  </Button>
                </Box>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ 
                    position: 'absolute',
                    top: -40,
                    right: 0,
                    zIndex: 1
                  }}>
                    <Button
                      size="small"
                      onClick={clearPreviewData}
                      sx={{ mr: 1 }}
                    >
                      Clear Preview
                    </Button>
                  </Box>
                  <JsonPreview previewData={previewData} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </>
  );
};

export default DataDisplay;