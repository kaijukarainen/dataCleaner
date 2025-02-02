import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, PreviewData } from '../utils/storage';

interface UsePreviewDataReturn {
  previewData: PreviewData | null;
  setPreviewData: (data: PreviewData | null) => void;
  clearPreviewData: () => void;
  isLoading: boolean;
  error: Error | null;
}

export function usePreviewData(): UsePreviewDataReturn {
  const [previewData, setPreviewDataState] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Read initial value from localStorage
  useEffect(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.PREVIEW_DATA);
      if (item) {
        const parsedItem = JSON.parse(item);
        setPreviewDataState(parsedItem);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load preview data'));
      console.warn('Error reading preview data from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle setting new preview data
  const setPreviewData = useCallback((data: PreviewData | null) => {
    try {
      if (data) {
        localStorage.setItem(STORAGE_KEYS.PREVIEW_DATA, JSON.stringify(data));
        setPreviewDataState(data);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PREVIEW_DATA);
        setPreviewDataState(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save preview data'));
      console.warn('Error saving preview data to localStorage:', err);
    }
  }, []);

  // Clear preview data
  const clearPreviewData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.PREVIEW_DATA);
    setPreviewDataState(null);
    setError(null);
  }, []);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.PREVIEW_DATA) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : null;
          setPreviewDataState(newValue);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to parse storage update'));
          console.warn('Error handling storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    previewData,
    setPreviewData,
    clearPreviewData,
    isLoading,
    error
  };
}