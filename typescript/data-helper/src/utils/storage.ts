import { ParsedData, Schema } from '../types/types';

export interface PreviewData {
  [key: string]: any;
}

export const STORAGE_KEYS = {
  SCHEMAS: 'document-parser-schemas',
  LAST_PARSED_DATA: 'document-parser-last-data',
  PREVIEW_DATA: 'document-parser-preview-data',
} as const;

export const saveSchemas = (schemas: Schema[]): void => {
  localStorage.setItem(STORAGE_KEYS.SCHEMAS, JSON.stringify(schemas));
};

export const getSchemas = (): Schema[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.SCHEMAS);
  return saved ? JSON.parse(saved) : [];
};

export const saveLastParsedData = (data: ParsedData): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_PARSED_DATA, JSON.stringify(data));
};

export const getLastParsedData = (): ParsedData | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.LAST_PARSED_DATA);
  return saved ? JSON.parse(saved) : null;
};

export const savePreviewData = (data: PreviewData): void => {
  localStorage.setItem(STORAGE_KEYS.PREVIEW_DATA, JSON.stringify(data));
};

export const getPreviewData = (): PreviewData | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.PREVIEW_DATA);
  return saved ? JSON.parse(saved) : null;
};

// Helper function to clear specific storage
export const clearStorage = (key: keyof typeof STORAGE_KEYS): void => {
  localStorage.removeItem(STORAGE_KEYS[key]);
};

// Helper function to clear all app storage
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};