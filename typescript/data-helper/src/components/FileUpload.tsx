import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Button,
  useTheme 
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ParsedData } from '../types/types';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed, loading, setLoading }) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleGetData = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8080/api/parse', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onDataParsed(data);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={(theme) => ({
          p: 3,
          mt: 3,
          mb: 2,
          textAlign: 'center',
          backgroundColor: isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
          cursor: 'pointer',
          border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
          transition: theme.transitions.create(['border-color', 'background-color']),
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.primary.main,
          }
        })}
      >
        <input {...getInputProps()} />
        <Box sx={{ 
          minHeight: 120, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}>
          <Upload size={40} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag and drop a file here, or click to select'}
          </Typography>
        </Box>
      </Paper>

      {selectedFile && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius,
          bgcolor: theme.palette.grey[50]
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FileText size={20} />
            <Typography>
              Selected file: {selectedFile.name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleGetData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Get Data
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;