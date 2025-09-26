export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface QueryOptions {
  view?: string;
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
}

export interface UpdateRecord {
  id: string;
  fields: Record<string, any>;
}

export interface CreateRecord {
  fields: Record<string, any>;
}

export interface DeleteResult {
  id: string;
  deleted: boolean;
}

export * from './types';