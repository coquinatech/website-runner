import { Form470DAO } from './Form470DAO';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../..', '.env') });

async function exampleUsage(): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY not found in .env file');
    return;
  }

  const dao = new Form470DAO(apiKey);

  try {
    // Example 1: Get a specific Form 470 by application number
    console.log('=== Getting Form 470 by Application Number ===');
    const applicationNumber = '251042800'; // From the sample data
    const form470 = await dao.get470ByApplicationNumber(applicationNumber);
    
    if (form470) {
      console.log(`Found Form 470 for application ${applicationNumber}:`);
      console.log(`- Title: ${form470.fields.Title}`);
      console.log(`- Buyer: ${form470.fields.Buyer}`);
      console.log(`- State: ${form470.fields.State}`);
      console.log(`- Status: ${form470.fields.Status}`);
      console.log(`- Total Funding Commitment: $${form470.fields['Total Funding Commitment'].toLocaleString()}`);
      
      // Parse line items JSON
      if (form470.fields['Line Items JSON']) {
        const lineItems = JSON.parse(form470.fields['Line Items JSON']);
        console.log('- Line Items:', JSON.stringify(lineItems, null, 2));
      }
    } else {
      console.log(`No Form 470 found with application number: ${applicationNumber}`);
    }

    // Example 2: Get all Form 470s for a state
    console.log('\n=== Getting all Form 470s for Oregon ===');
    const oregonForms = await dao.get470sByState('OR');
    console.log(`Found ${oregonForms.length} Form 470s in Oregon`);
    
    oregonForms.slice(0, 3).forEach(form => {
      console.log(`- ${form.fields['Application Number']}: ${form.fields.Buyer} - $${form.fields['Total Funding Commitment'].toLocaleString()}`);
    });

    // Example 3: Get all committed Form 470s
    console.log('\n=== Getting all Committed Form 470s ===');
    const committedForms = await dao.get470sByStatus('Committed');
    console.log(`Found ${committedForms.length} committed Form 470s`);

    // Example 4: Get Form 470s for funding year 2025
    console.log('\n=== Getting Form 470s for Funding Year 2025 ===');
    const fy2025Forms = await dao.get470sByFundingYear('2025');
    console.log(`Found ${fy2025Forms.length} Form 470s for FY 2025`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
  }
}

exampleUsage();