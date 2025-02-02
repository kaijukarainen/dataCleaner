import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

interface PreviewProps {
  data: any | null;
  loading: boolean;
}

const Preview: React.FC<PreviewProps> = ({ data, loading }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400 
      }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  // Convert any data into a displayable format
  const convertToDisplayableData = (data: any, sectionName: string) => {
    if (Array.isArray(data)) {
      // If it's an array, use it directly with DataGrid
      const columns = Object.keys(data[0] || {}).map(key => ({
        field: key,
        headerName: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        flex: 1,
        minWidth: 150
      }));

      return {
        columns,
        rows: data.map((item, index) => ({ id: index, ...item }))
      };
    } else if (typeof data === 'object' && data !== null) {
      // If it's an object, convert to key-value pairs
      const columns = [
        { field: 'key', headerName: 'Field', flex: 1, minWidth: 150 },
        { field: 'value', headerName: 'Value', flex: 2, minWidth: 200 }
      ];

      const rows = Object.entries(data).map(([key, value], index) => ({
        id: index,
        key: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));

      return { columns, rows };
    }

    // Fallback for primitive values
    return {
      columns: [
        { field: 'key', headerName: 'Field', flex: 1 },
        { field: 'value', headerName: 'Value', flex: 2 }
      ],
      rows: [{ id: 0, key: sectionName, value: String(data) }]
    };
  };

  // Get all sections from the data
  const sections = Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      data: value
    }));

  if (sections.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400 
      }}>
        <Typography color="text.secondary">No data sections found</Typography>
      </Box>
    );
  }

  const currentSection = sections[selectedTab];
  const displayData = convertToDisplayableData(currentSection.data, currentSection.name);

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, newValue) => setSelectedTab(newValue)}
        >
          {sections.map((section) => (
            <Tab key={section.name} label={section.name} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ height: 600, p: 2 }}>
        <DataGrid
          rows={displayData.rows}
          columns={displayData.columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>
    </Paper>
  );
};

export default Preview;