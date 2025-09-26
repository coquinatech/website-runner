import Airtable from 'airtable';
import { AirtableRecord, QueryOptions, UpdateRecord, CreateRecord, DeleteResult } from './types';

class AirtableService {
  private apiKey: string;
  private baseId: string;
  private base: Airtable.Base;

  constructor(apiKey: string, baseId: string) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.base = new Airtable({ apiKey }).base(baseId);
  }

  async getAllRecords(tableName: string, options: QueryOptions = {}): Promise<AirtableRecord[]> {
    const { view, filterByFormula, maxRecords, pageSize, sort } = options;
    const records: AirtableRecord[] = [];
    
    const query = this.base(tableName).select({
      ...(view && { view }),
      ...(filterByFormula && { filterByFormula }),
      ...(maxRecords && { maxRecords }),
      ...(pageSize && { pageSize }),
      ...(sort && { sort })
    });

    await query.eachPage((pageRecords, fetchNextPage) => {
      records.push(...pageRecords.map(record => ({
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      })));
      fetchNextPage();
    });

    return records;
  }

  async getRecord(tableName: string, recordId: string): Promise<AirtableRecord> {
    try {
      const record = await this.base(tableName).find(recordId);
      return {
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      };
    } catch (error: any) {
      throw new Error(`Failed to get record: ${error.message}`);
    }
  }

  async createRecord(tableName: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      const record = await this.base(tableName).create(fields);
      return {
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      };
    } catch (error: any) {
      throw new Error(`Failed to create record: ${error.message}`);
    }
  }

  async createRecords(tableName: string, recordsArray: CreateRecord[]): Promise<AirtableRecord[]> {
    try {
      const records = await this.base(tableName).create(recordsArray);
      return records.map(record => ({
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      }));
    } catch (error: any) {
      throw new Error(`Failed to create records: ${error.message}`);
    }
  }

  async updateRecord(tableName: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      const record = await this.base(tableName).update(recordId, fields);
      return {
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      };
    } catch (error: any) {
      throw new Error(`Failed to update record: ${error.message}`);
    }
  }

  async updateRecords(tableName: string, updates: UpdateRecord[]): Promise<AirtableRecord[]> {
    try {
      const records = await this.base(tableName).update(updates);
      return records.map(record => ({
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      }));
    } catch (error: any) {
      throw new Error(`Failed to update records: ${error.message}`);
    }
  }

  async deleteRecord(tableName: string, recordId: string): Promise<DeleteResult> {
    try {
      const result = await this.base(tableName).destroy(recordId);
      return { id: result.id, deleted: true };
    } catch (error: any) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  async deleteRecords(tableName: string, recordIds: string[]): Promise<DeleteResult[]> {
    try {
      const results = await this.base(tableName).destroy(recordIds);
      return results.map(result => ({ id: result.id, deleted: true }));
    } catch (error: any) {
      throw new Error(`Failed to delete records: ${error.message}`);
    }
  }

  async replaceRecord(tableName: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      const record = await this.base(tableName).replace(recordId, fields);
      return {
        id: record.id,
        fields: record.fields,
        createdTime: (record as any)._rawJson.createdTime
      };
    } catch (error: any) {
      throw new Error(`Failed to replace record: ${error.message}`);
    }
  }

  async findRecordByField(tableName: string, fieldName: string, value: string): Promise<AirtableRecord | null> {
    const filterByFormula = `{${fieldName}} = '${value}'`;
    const records = await this.getAllRecords(tableName, { filterByFormula, maxRecords: 1 });
    return records.length > 0 ? records[0] : null;
  }

  async findRecordsByFormula(tableName: string, formula: string): Promise<AirtableRecord[]> {
    return await this.getAllRecords(tableName, { filterByFormula: formula });
  }
}

export default AirtableService;