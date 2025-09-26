import AirtableService from './airtableService';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AirtableRecord } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function getAllFieldsFromTable(): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app742LUED30ISmmF';
  const tableName = 'tblPRqxmCUOo09XCP';
  
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY not found in .env file');
    return;
  }

  const airtable = new AirtableService(apiKey, baseId);
  
  try {
    console.log('Fetching records to analyze all fields...\n');
    
    const records: AirtableRecord[] = await airtable.getAllRecords(tableName, {
      maxRecords: 10,
      view: 'viwxQMzxTvYjB3mGX'
    });

    if (records.length > 0) {
      const allFieldNames = new Set<string>();
      
      records.forEach(record => {
        Object.keys(record.fields).forEach(fieldName => {
          allFieldNames.add(fieldName);
        });
      });

      console.log('All fields found in the table:');
      console.log('================================');
      Array.from(allFieldNames).sort().forEach(field => {
        console.log(`- ${field}`);
      });
      
      console.log('\n\nFirst record with all its fields:');
      console.log('==================================');
      console.log(JSON.stringify(records[0], null, 2));
      
      const firstRecordFields = records[0].fields;
      const emptyFields = Array.from(allFieldNames).filter(
        field => !firstRecordFields.hasOwnProperty(field)
      );
      
      if (emptyFields.length > 0) {
        console.log('\nFields not present in the first record (likely empty):');
        console.log('======================================================');
        emptyFields.forEach(field => console.log(`- ${field}`));
      }
      
    } else {
      console.log('No records found in the specified table/view.');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching records:', errorMessage);
  }
}

async function getTableSchema(): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'app742LUED30ISmmF';
  
  console.log('\n\nAttempting to fetch table schema...');
  console.log('===================================');
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Table schema:', JSON.stringify(data, null, 2));
    } else {
      console.log('Note: Metadata API requires specific permissions. Using record analysis instead.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Could not fetch schema:', errorMessage);
  }
}

getAllFieldsFromTable().then(() => getTableSchema());