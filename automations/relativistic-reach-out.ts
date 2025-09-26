import { chromium } from '@playwright/test';
import { Form470DAO } from '../airtable/dao/Form470DAO';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface ContactFormData {
  name: string;
  companyUrl: string;
  email: string;
  helpNeeded: string;
}

async function fillReachOutForm(data: ContactFormData) {
  const browser = await chromium.launch({
    headless: false, // Set to true for headless mode
    channel: 'chrome', // Use Chrome instead of Chromium
  });

  // Helper function to add random delay
  const randomDelay = async () => {
    const delay = 100 + Math.floor(Math.random() * 100); // 100-200ms
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to Relativistic reach out page...');
    await page.goto('https://relativistic.io/reach-out');
    await randomDelay();

    console.log('Filling out the form...');
    
    // Fill in the name
    await page.getByRole('textbox', { name: 'Name' }).click();
    await randomDelay();
    await page.getByRole('textbox', { name: 'Name' }).fill(data.name);
    await randomDelay();
    
    // Fill in the company URL
    await page.getByRole('textbox', { name: 'Company URL' }).click();
    await randomDelay();
    await page.getByRole('textbox', { name: 'Company URL' }).fill(data.companyUrl);
    await randomDelay();
    
    // Fill in the email
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await randomDelay();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(data.email);
    await randomDelay();
    
    // Fill in what help is needed
    await page.getByRole('textbox', { name: 'What are you looking for help' }).click();
    await randomDelay();
    await page.getByRole('textbox', { name: 'What are you looking for help' }).fill(data.helpNeeded);
    await randomDelay();
    
    console.log('Submitting the form...');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait a bit to see the result
    await page.waitForTimeout(2000);
    
    console.log('Form submitted successfully!');
    
  } catch (error) {
    console.error('Error filling form:', error);
  } finally {
    await browser.close();
  }
}

// Get Form 470 data by application number
async function getForm470Data(applicationNumber: string): Promise<ContactFormData | null> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  
  if (!apiKey) {
    console.error('AIRTABLE_API_KEY not found in .env file');
    return null;
  }

  const dao = new Form470DAO(apiKey);
  
  try {
    const form470 = await dao.get470ByApplicationNumber(applicationNumber);
    
    if (!form470) {
      console.error(`No Form 470 found with application number: ${applicationNumber}`);
      return null;
    }
    
    // Extract contact data from Form 470
    const contactData: ContactFormData = {
      name: form470.fields['Contact Name'] || 'Not provided',
      companyUrl: form470.fields.Buyer.toLowerCase().replace(/\s+/g, '') + '.org', // Simple URL generation
      email: form470.fields['Contact Email'] || 'Not provided',
      helpNeeded: `E-Rate Form 470 - ${form470.fields.Title} - ${form470.fields['Funding Narrative'] || 'Infrastructure support'}`
    };
    
    console.log('\nForm 470 Data Retrieved:');
    console.log(`- Application Number: ${form470.fields['Application Number']}`);
    console.log(`- Buyer: ${form470.fields.Buyer}`);
    console.log(`- Contact: ${contactData.name}`);
    console.log(`- Email: ${contactData.email}`);
    console.log(`- Total Funding: $${form470.fields['Total Funding Commitment'].toLocaleString()}`);
    console.log('\n');
    
    return contactData;
  } catch (error) {
    console.error('Error fetching Form 470:', error);
    return null;
  }
}

// Main function
async function main() {
  // Get application number from command line
  const applicationNumber = process.argv[2];
  
  if (!applicationNumber) {
    console.error('Please provide an application number as a command line argument');
    console.error('Usage: npm run automation:relativistic <application-number>');
    console.error('Example: npm run automation:relativistic 251042800');
    process.exit(1);
  }
  
  console.log(`Fetching Form 470 data for application: ${applicationNumber}...`);
  
  const contactData = await getForm470Data(applicationNumber);
  
  if (!contactData) {
    console.error('Failed to retrieve Form 470 data');
    process.exit(1);
  }
  
  // Run the automation with the retrieved data
  await fillReachOutForm(contactData);
}

// Run the main function
main().catch(console.error);