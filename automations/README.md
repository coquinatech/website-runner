# Automations

This directory contains standalone automation scripts built with Playwright.

## Available Scripts

### Relativistic Reach Out Form
Automates filling out the contact form on relativistic.io using E-Rate Form 470 data from Airtable.

**Run:**
```bash
npm run automation:relativistic -- <application-number>

# Example:
npm run automation:relativistic -- 251042800
```

**How it works:**
1. Fetches Form 470 data from Airtable using the application number
2. Extracts contact information (name, email)
3. Generates a company URL based on the buyer name
4. Creates a help request message with Form 470 details
5. Fills out and submits the relativistic.io contact form

**Requirements:**
- `AIRTABLE_API_KEY` must be set in your `.env` file
- The application number must exist in the Airtable database

## Creating New Automations

1. Create a new TypeScript file in the `automations` directory
2. Import Playwright: `import { chromium } from '@playwright/test';`
3. Create your automation logic
4. Add a new script to `package.json` to run it

## Configuration

- Set `headless: true` in browser.launch() to run without UI
- Add delays with `page.waitForTimeout()` as needed
- Use `page.waitForSelector()` to wait for elements to appear