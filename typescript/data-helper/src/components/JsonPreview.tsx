import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Button,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { usePreviewData } from '../hooks/usePreviewData';
import { exportToCSV, exportToExcel } from '../utils/export';

interface JsonPreviewProps {
  previewData?: any;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ previewData }) => {
  const theme = useTheme();
  const [sections, setSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  
  const { 
    previewData: storedPreviewData, 
    setPreviewData: setStoredPreviewData,
    isLoading 
  } = usePreviewData();

  useEffect(() => {
    try {
      // Prioritize props data over stored data
      const dataToUse = previewData || storedPreviewData;
      
      if (dataToUse) {
        const data = typeof dataToUse === 'string' 
          ? JSON.parse(
              dataToUse.startsWith('```json') 
                ? dataToUse.slice(7, -3).trim() 
                : dataToUse
            )
          : dataToUse;

        setParsedData(data);
        const topLevelKeys = Object.keys(data);
        setSections(topLevelKeys);

        // Update stored data if new data came from props
        if (previewData && previewData !== storedPreviewData) {
          setStoredPreviewData(data);
        }
      }
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  }, [previewData, storedPreviewData, setStoredPreviewData]);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = (type: 'csv' | 'excel') => {
    if (type === 'csv') {
      exportToCSV(parsedData);
    } else {
      exportToExcel(parsedData);
    }
    handleExportClose();
  };

  const renderObject = (obj: Record<string, any>) => {
    return (
      <Paper sx={{ overflow: 'auto', maxHeight: 600 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(obj).map(([key, value], index) => (
              <TableRow key={index}>
                <TableCell 
                  component="th" 
                  scope="row" 
                  sx={{ 
                    fontWeight: 'medium',
                    backgroundColor: theme.palette.background.default
                  }}
                >
                  {key}
                </TableCell>
                <TableCell>
                  {typeof value === 'object' ? (
                    <Box sx={{ maxHeight: '150px', overflow: 'auto' }}>
                      {renderValue(value)}
                    </Box>
                  ) : (
                    String(value)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  const renderArray = (array: any[]) => {
    if (array.length === 0) {
      return (
        <Typography color="textSecondary">
          Empty array
        </Typography>
      );
    }

    // If array contains objects, render as table
    if (typeof array[0] === 'object' && array[0] !== null) {
      const headers = Array.from(
        new Set(array.flatMap(item => Object.keys(item)))
      );

      return (
        <Paper sx={{ overflow: 'auto', maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell 
                    key={index} 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: theme.palette.grey[100]
                    }}
                  >
                    {header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' ')}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {array.map((item, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>
                      {item[header] !== undefined
                        ? typeof item[header] === 'object'
                          ? JSON.stringify(item[header])
                          : String(item[header])
                        : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      );
    }

    // For arrays of primitive values
    return (
      <Box sx={{ pl: 2, borderLeft: `2px solid ${theme.palette.divider}` }}>
        {array.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            {typeof item === 'object' ? renderValue(item) : String(item)}
          </Box>
        ))}
      </Box>
    );
  };

  const renderValue = (value: any): React.ReactNode => {
    if (Array.isArray(value)) {
      return renderArray(value);
    } else if (value !== null && typeof value === 'object') {
      return renderObject(value);
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!parsedData) {
    return (
      <Card>
        <CardContent>
          <Typography color="textSecondary" align="center">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Data Preview
          </Typography>
          <Button
            variant="contained"
            onClick={handleExportClick}
            sx={{ ml: 2 }}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
          </Menu>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeSection}
            onChange={(_, newValue) => setActiveSection(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '.MuiTab-root': {
                textTransform: 'none',
                minWidth: 120,
              }
            }}
          >
            {sections.map((section, index) => (
              <Tab
                key={section}
                label={section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
                value={index}
                sx={{
                  fontWeight: activeSection === index ? 'bold' : 'normal'
                }}
              />
            ))}
          </Tabs>
        </Box>

        {sections.map((section, index) => (
          <Box
            key={section}
            role="tabpanel"
            hidden={activeSection !== index}
            sx={{ 
              mt: 2,
              display: activeSection === index ? 'block' : 'none'
            }}
          >
            {activeSection === index && renderValue(parsedData[section])}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default JsonPreview;