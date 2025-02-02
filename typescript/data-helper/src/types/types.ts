export interface ParsedData {
  tableData: any[];
  formData: Array<{
    key: string;
    value: string;
  }>;
  rawData: string;
}

export const DATA_TYPES = ['object', 'string', 'number', 'boolean', 'date', 'any'] as const;

export type ColumnDataType = typeof DATA_TYPES[number];

export interface SchemaColumn {
  title: string;
  order: number;
  dataType: ColumnDataType;
  objectSchema?: SchemaColumn[]; // Nested columns if dataType is 'object'
}

export interface Schema {
  id: string;
  name: string;
  columns: SchemaColumn[];
}