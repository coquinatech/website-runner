import AirtableService from './airtableService';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AirtableRecord, CreateRecord } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function exampleUsage(): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || 'your-base-id-here';
  
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY not found in .env file');
    return;
  }

  const airtable = new AirtableService(apiKey, baseId);
  
  try {
    console.log('=== Getting all records ===');
    const allRecords: AirtableRecord[] = await airtable.getAllRecords('YourTableName', {
      maxRecords: 10,
      sort: [{ field: 'Name', direction: 'asc' }]
    });
    console.log('Records:', allRecords);

    console.log('\n=== Creating a new record ===');
    const newRecord: AirtableRecord = await airtable.createRecord('YourTableName', {
      Name: 'Test Record',
      Status: 'Active',
      Description: 'Created via API'
    });
    console.log('Created record:', newRecord);

    console.log('\n=== Updating the record ===');
    const updatedRecord: AirtableRecord = await airtable.updateRecord('YourTableName', newRecord.id, {
      Status: 'Completed'
    });
    console.log('Updated record:', updatedRecord);

    console.log('\n=== Finding record by field ===');
    const foundRecord: AirtableRecord | null = await airtable.findRecordByField('YourTableName', 'Name', 'Test Record');
    console.log('Found record:', foundRecord);

    console.log('\n=== Using a filter formula ===');
    const filteredRecords: AirtableRecord[] = await airtable.findRecordsByFormula(
      'YourTableName',
      "AND({Status} = 'Active', {Priority} = 'High')"
    );
    console.log('Filtered records:', filteredRecords);

    console.log('\n=== Creating multiple records ===');
    const recordsToCreate: CreateRecord[] = [
      { fields: { Name: 'Batch Record 1', Status: 'Pending' } },
      { fields: { Name: 'Batch Record 2', Status: 'Pending' } }
    ];
    const multipleRecords: AirtableRecord[] = await airtable.createRecords('YourTableName', recordsToCreate);
    console.log('Created multiple records:', multipleRecords);

    console.log('\n=== Deleting a record ===');
    const deleteResult = await airtable.deleteRecord('YourTableName', newRecord.id);
    console.log('Delete result:', deleteResult);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
  }
}

exampleUsage();