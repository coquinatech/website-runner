import { Form470DAO } from './Form470DAO';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../..', '.env') });

async function testGet470ByApplicationNumber(): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY not found in .env file');
    return;
  }

  const dao = new Form470DAO(apiKey);

  try {
    // Test the get470ByApplicationNumber method
    const applicationNumber = '251042800';
    console.log(`Fetching Form 470 with application number: ${applicationNumber}\n`);
    
    const form470 = await dao.get470ByApplicationNumber(applicationNumber);
    
    if (form470) {
      console.log('✅ Successfully retrieved Form 470:');
      console.log(JSON.stringify(form470, null, 2));
    } else {
      console.log(`❌ No Form 470 found with application number: ${applicationNumber}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
  }
}

testGet470ByApplicationNumber();