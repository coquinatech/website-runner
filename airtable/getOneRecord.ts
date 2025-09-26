import AirtableService from './airtableService';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AirtableRecord } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function getOneRecord(): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app742LUED30ISmmF';
  const tableName = 'tblPRqxmCUOo09XCP';
  
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY not found in .env file');
    return;
  }

  const airtable = new AirtableService(apiKey, baseId);
  
  try {
    console.log('Fetching one record from Airtable...\n');
    
    const records: AirtableRecord[] = await airtable.getAllRecords(tableName, {
      maxRecords: 1,
      view: 'viwxQMzxTvYjB3mGX'
    });

    if (records.length > 0) {
      console.log('Record found:');
      console.log(JSON.stringify(records[0], null, 2));
    } else {
      console.log('No records found in the specified table/view.');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching record:', errorMessage);
    
    if (errorMessage.includes('NOT_AUTHORIZED')) {
      console.error('\nMake sure your API key has access to this base.');
    } else if (errorMessage.includes('TABLE_NOT_FOUND')) {
      console.error('\nThe table ID might be incorrect or the table was deleted.');
    }
  }
}

getOneRecord();