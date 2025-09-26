import { chromium } from '@playwright/test';
import { Form470DAO } from '../airtable/dao/Form470DAO';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface RuckusDealData {
  // Authentication
  username: string;
  password: string;
  
  // Customer Info
  customerName: string;
  
  // Address (with fallbacks)
  street?: string;
  city?: string;
  state: string;
  zipCode?: string;
  
  // Contact Details
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  
  // Deal Information
  fundingYear: string;
  dealValue: number;
  projectName: string;
  projectDescription: string;
  partnerComments: string;
}

// Validate minimum required Form470 fields
function validateForm470Data(form470: any): string[] {
  const errors: string[] = [];
  const required = [
    'Buyer',
    'Contact Name', 
    'Contact Email',
    'Contact Phone Number',
    'State',
    'Funding Year',
    'Total Funding Commitment'
  ];
  
  required.forEach(field => {
    if (!form470.fields[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  return errors;
}

// Transform Form470 data to RuckusDealData
function transformForm470ToRuckusData(form470: any): RuckusDealData {
  // Split contact name into first/last
  const fullName = form470.fields['Contact Name'] || '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  return {
    // Credentials from environment variables
    username: process.env.RUCKUS_USERNAME || 'thomas.smyth@rwbigdog.com',
    password: process.env.RUCKUS_PASSWORD || 'zfp@qjp8nte3MYM2eyp!',
    
    // Customer info from Form470
    customerName: form470.fields.Buyer,
    
    // Address fields (leave blank if missing)
    street: '', // Not available in Form470
    city: '', // Not available in Form470
    state: form470.fields.State,
    zipCode: '', // Not available in Form470
    
    // Contact details
    firstName,
    lastName,
    title: 'Authorized Person', // Default as specified
    phone: form470.fields['Contact Phone Number'],
    email: form470.fields['Contact Email'],
    
    // Deal information
    fundingYear: form470.fields['Funding Year'],
    dealValue: form470.fields['Total Funding Commitment'] || '40000',
    projectName: `E-Rate Opportunity with ${form470.fields.Buyer}`,
    projectDescription: `E-Rate Opportunity with ${form470.fields.Buyer}. This is a Cat2 Ruckus named 470.`,
    partnerComments:''
  };
}

async function fillRuckusDealRegistration(data: RuckusDealData) {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
  });

  // Helper function to add random delay
  const randomDelay = async () => {
    const delay = 1000 + Math.floor(Math.random() * 100); // 100-200ms
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  try {
    const context = await browser.newContext();
    const page1 = await context.newPage();

    console.log('Navigating to Ruckus Partner Portal...');
    await page1.goto('https://ruckuswireless.my.salesforce.com/secur/login_portal.jsp?orgId=00D500000006n2C&portalId=060500000008oLP&un=thomas.smyth%40rwbigdog.com&startURL=https%3A%2F%2Fruckuswireless.my.salesforce.com&ec=1515&eco=1&fl=1');
    await randomDelay();

    console.log('Logging in with credentials...');
    await page1.getByRole('textbox', { name: 'User Name:' }).click();
    await randomDelay();
    await page1.getByRole('textbox', { name: 'User Name:' }).fill(data.username);
    await randomDelay();
    
    await page1.getByRole('textbox', { name: 'Password:' }).click();
    await randomDelay();
    await page1.getByRole('textbox', { name: 'Password:' }).fill(data.password);
    await randomDelay();
    
    await page1.getByRole('button', { name: 'Login' }).click();
    await randomDelay();

    console.log('Navigating to Deal Registration...');
    await page1.locator('iframe[name="06650000000UDLA"]').contentFrame().getByText('Deal Registration').click();
    await randomDelay();
    await page1.locator('iframe[name="06650000000UDLA"]').contentFrame().getByRole('link', { name: 'Register a Deal' }).click();
    await randomDelay();


    await page1.locator('input[name="searchPageId:formId:pgBlockId:pgBlockSection1Id:pgBlockSection1Item1Id:accNameId"]').click();
    await randomDelay();
    await page1.locator('input[name="searchPageId:formId:pgBlockId:pgBlockSection1Id:pgBlockSection1Item1Id:accNameId"]').fill(data.customerName);
    await randomDelay();


    // Set country to United States
    console.log('Setting country to United States...');
    await page1.locator('input[name="searchPageId:formId:pgBlockId:pgBlockSection1Id:pgBlockSection1Item2Id:CountryInputField"]').click();
    await randomDelay();
    await page1.locator('input[name="searchPageId:formId:pgBlockId:pgBlockSection1Id:pgBlockSection1Item2Id:CountryInputField"]').fill('United States');
    await randomDelay();


    console.log('Searching for existing customer...');
    await page1.getByRole('button', { name: 'Search for Existing Customer' }).click();
    await randomDelay();

    // Check for warning message about no results
    const warningExists = await page1.locator('.messageText').count() > 0;
    if (warningExists) {
      const warningText = await page1.locator('.messageText').textContent();
      if (warningText && warningText.includes('Account records not found')) {
        console.log(`⚠️  Customer "${data.customerName}" not found in existing records.`);
        console.log('📝 Clicking "Create New" to create a new customer record...');
        
        // Click the first "Create New" button (there are 2 on the page)
        await page1.getByRole('button', { name: 'Create New' }).first().click();
        await randomDelay();
        
        console.log('✅ Proceeding with new customer creation...');
      }
    } else {
      // Select the first customer result if found
      console.log('Selecting customer from search results...');
      try {
        await page1.locator('input[name="searchPageId:formId:pgBlockId:pgBlockSection2Id:pgBlockTableId:0:checkBoxes"]').check();
            await page1.locator('input[name="searchPageId:formId:pgBlockId:j_id2:bottom:j_id3"]').click();

        await randomDelay();
      } catch (error) {
        console.log('❌ Could not select customer from results. Manual intervention required.');
        throw error;
      }
    }
    await randomDelay();

    console.log('Setting deal flags...');
    await page1.getByLabel('Federal Deal Flag').selectOption('No');
    await randomDelay();
    await page1.getByLabel('E-Rate Deal?').selectOption('true');
    await randomDelay();

    // Navigate to step 1
    // console.log('Proceeding to deal workflow step 1...');
    // await page1.goto('https://ruckuswireless--c.vf.force.com/apex/DealRegWorkflowStep1');
    // await randomDelay();

    console.log('Filling E-Rate specific information...');
    await page1.getByLabel('Was this Lead passed to you').selectOption('No');
    await randomDelay();
    await page1.getByLabel('*E-Rate Funding Year').selectOption(data.fundingYear);
    await randomDelay();

    // Set bid due date (using same logic as original test)
    console.log('Setting bid due date...');
    await page1.getByRole('textbox', { name: '* Bid Due Date' }).click();
    await randomDelay();
    await page1.getByRole('button', { name: 'Next Month' }).dblclick();
    await randomDelay();
    await page1.getByRole('gridcell', { name: '19' }).click();
    await randomDelay();

    console.log('Setting manufacturer and distributor...');
    await page1.getByLabel('Manufacturer Specified on').selectOption('Ruckus');
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Distributor' }).click();
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Distributor' }).fill('TD SYNNEX - US');
    await randomDelay();

    console.log('Filling address information...');

    // Fill address fields if available, otherwise leave blank
    if (data.street) {
      await page1.getByRole('textbox', { name: 'Street' }).fill(data.street);
      await randomDelay();
    }
    
    if (data.city) {
      await page1.getByRole('textbox', { name: 'City' }).fill(data.city);
      await randomDelay();
    }
    
    if (data.state) {
      await page1.getByRole('textbox', { name: 'State/Province' }).fill(data.state);
      await randomDelay();
    }
    
    if (data.zipCode) {
      await page1.getByRole('textbox', { name: 'Zip/Postal Code' }).fill(data.zipCode);
      await randomDelay();
    }

    // Set estimated close date (using same logic as original test)
    console.log('Setting estimated close date...');
    await page1.getByRole('textbox', { name: '* Estimated Close Date' }).fill('7/1/2026');
    await randomDelay();
    await page1.getByRole('textbox', { name: '* First Name' }).click();

    console.log('Filling contact information...');
    await page1.getByRole('textbox', { name: '* First Name' }).fill(data.firstName);
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Last Name' }).fill(data.lastName);
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Title' }).fill(data.title);
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Phone' }).fill(data.phone);
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Email' }).fill(data.email);
    await randomDelay();
    await page1.getByRole('textbox', { name: 'Country' }).fill('United States');

    console.log('Setting product options...');
    await page1.getByLabel('*Do you want to add products').selectOption('No');
    await randomDelay();

    console.log('Filling deal value and project information...');
    await page1.getByRole('textbox', { name: 'Estimated Deal Value' }).fill(data.dealValue +'');
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Project Name' }).fill(data.projectName);
    await randomDelay();
    await page1.getByRole('textbox', { name: '* Project Description' }).fill(data.projectDescription);
    await randomDelay();
    await page1.getByRole('textbox', { name: 'Partner Comments' }).fill('We would love to bid on this opportunity with you if you don\'t already have a partner. Thank you for the consideration!');
    await randomDelay();

    // Take final screenshot for audit trail
    console.log('Taking final screenshot for audit trail...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page1.screenshot({ 
      path: `screenshots/ruckus-deal-${timestamp}.png`,
      fullPage: true 
    });

    console.log('✅ Form completed successfully! Review the information before manual submission.');
    console.log('📸 Screenshot saved for audit trail');
    console.log('⚠️  Form is ready but NOT submitted - manual review required');

    // Wait for user to review
    console.log('Keeping browser open for manual review...');
    await page1.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error filling Ruckus deal registration:', error);
    throw error;
  } finally {
    // Don't close browser automatically to allow manual review
    console.log('Browser kept open for manual review and submission');
  }
}

// Get Form 470 data by application number
async function getForm470Data(applicationNumber: string): Promise<RuckusDealData | null> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ AIRTABLE_API_KEY not found in .env file');
    return null;
  }

  const dao = new Form470DAO(apiKey);
  
  try {
    console.log(`🔍 Fetching Form 470 data for application: ${applicationNumber}...`);
    const form470 = await dao.get470ByApplicationNumber(applicationNumber);
    
    if (!form470) {
      console.error(`❌ No Form 470 found with application number: ${applicationNumber}`);
      return null;
    }

    // Validate required fields
    const validationErrors = validateForm470Data(form470);
    if (validationErrors.length > 0) {
      console.error('❌ Form 470 validation failed:');
      validationErrors.forEach(error => console.error(`  - ${error}`));
      return null;
    }
    
    // Transform data
    const dealData = transformForm470ToRuckusData(form470);
    
    console.log('\n✅ Form 470 Data Retrieved and Validated:');
    console.log(`- Application Number: ${form470.fields['Application Number']}`);
    console.log(`- Buyer: ${form470.fields.Buyer}`);
    console.log(`- Contact: ${dealData.firstName} ${dealData.lastName}`);
    console.log(`- Email: ${dealData.email}`);
    console.log(`- Phone: ${dealData.phone}`);
    console.log(`- State: ${dealData.state}`);
    console.log(`- Funding Year: ${dealData.fundingYear}`);
    console.log(`- Total Funding: $${form470.fields['Total Funding Commitment'].toLocaleString()}`);
    console.log(`- Project: ${dealData.projectName}`);
    console.log('\n');
    
    return dealData;
  } catch (error) {
    console.error('❌ Error fetching Form 470:', error);
    return null;
  }
}

// Main function
async function main() {
  // Get application number from command line
  const applicationNumber = process.argv[2];
  
  if (!applicationNumber) {
    console.error('❌ Please provide an application number as a command line argument');
    console.error('Usage: npm run automation:ruckus <application-number>');
    console.error('Example: npm run automation:ruckus 251042800');
    process.exit(1);
  }
  
  console.log(`🚀 Starting Ruckus Deal Registration for Form 470: ${applicationNumber}`);
  
  const dealData = await getForm470Data(applicationNumber);
  
  if (!dealData) {
    console.error('❌ Failed to retrieve or validate Form 470 data');
    process.exit(1);
  }

  // Ensure screenshots directory exists
  const fs = await import('fs');
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }
  
  // Run the automation with the retrieved data
  await fillRuckusDealRegistration(dealData);
}

// Run the main function
main().catch(console.error);