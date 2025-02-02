import React from 'react';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import theme from './theme';
import { FileUpload, DataDisplay } from './components';
import { ParsedData } from './types/types';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [parsedData, setParsedData] = useLocalStorage<ParsedData | null>('lastParsedData', null);
  const [loading, setLoading] = React.useState(false);

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <FileUpload 
          onDataParsed={handleDataParsed}
          loading={loading}
          setLoading={setLoading}
        />
        {parsedData && (
          <DataDisplay 
            data={parsedData}
            loading={loading}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;