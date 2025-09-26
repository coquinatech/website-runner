import AirtableService from '../airtableService';
import { Form470Record, Form470Fields } from './types';

export class Form470DAO {
  private airtableService: AirtableService;
  private readonly baseId = 'app742LUED30ISmmF';
  private readonly tableName = 'tblPRqxmCUOo09XCP';

  constructor(apiKey: string) {
    this.airtableService = new AirtableService(apiKey, this.baseId);
  }

  /**
   * Get a Form 470 record by Application Number
   * @param applicationNumber - The application number to search for
   * @returns The first matching Form470Record or null if not found
   */
  async get470ByApplicationNumber(applicationNumber: string): Promise<Form470Record | null> {
    try {
      const filterByFormula = `{Application Number} = '${applicationNumber}'`;
      const records = await this.airtableService.getAllRecords(this.tableName, {
        filterByFormula,
        maxRecords: 1
      });

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      return {
        id: record.id,
        fields: record.fields as Form470Fields,
        createdTime: record.createdTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get Form 470 by application number: ${errorMessage}`);
    }
  }

  /**
   * Get all Form 470 records for a specific state
   * @param state - The state abbreviation (e.g., "OR", "WA")
   * @returns Array of Form470Records
   */
  async get470sByState(state: string): Promise<Form470Record[]> {
    try {
      const filterByFormula = `{State} = '${state}'`;
      const records = await this.airtableService.getAllRecords(this.tableName, {
        filterByFormula
      });

      return records.map(record => ({
        id: record.id,
        fields: record.fields as Form470Fields,
        createdTime: record.createdTime
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get Form 470s by state: ${errorMessage}`);
    }
  }

  /**
   * Get all Form 470 records for a specific funding year
   * @param fundingYear - The funding year (e.g., "2025")
   * @returns Array of Form470Records
   */
  async get470sByFundingYear(fundingYear: string): Promise<Form470Record[]> {
    try {
      const filterByFormula = `{Funding Year} = '${fundingYear}'`;
      const records = await this.airtableService.getAllRecords(this.tableName, {
        filterByFormula
      });

      return records.map(record => ({
        id: record.id,
        fields: record.fields as Form470Fields,
        createdTime: record.createdTime
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get Form 470s by funding year: ${errorMessage}`);
    }
  }

  /**
   * Get all Form 470 records by status
   * @param status - The status (e.g., "Committed", "Pending")
   * @returns Array of Form470Records
   */
  async get470sByStatus(status: string): Promise<Form470Record[]> {
    try {
      const filterByFormula = `{Status} = '${status}'`;
      const records = await this.airtableService.getAllRecords(this.tableName, {
        filterByFormula
      });

      return records.map(record => ({
        id: record.id,
        fields: record.fields as Form470Fields,
        createdTime: record.createdTime
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get Form 470s by status: ${errorMessage}`);
    }
  }
}