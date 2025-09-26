# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Commands

**Development:**
- `npm run build` - Compile TypeScript files
- `npm run dev` - Watch mode for TypeScript compilation
- `tsx <file.ts>` - Run any TypeScript file directly

**Testing:**
- `npm test` - Run all Playwright tests
- `npm test <test-file>` - Run specific test file
- `npm run test:ui` - Interactive test UI for debugging
- `npm run test:headed` - Run tests with visible browser

**Airtable Scripts:**
- `npm run airtable:get-one` - Fetch single record example
- `npm run airtable:get-all-fields` - Analyze all fields in table
- `npm run airtable:test-get470` - Test Form470DAO.get470ByApplicationNumber()

**Automations:**
- `npm run automation:relativistic -- <application-number>` - Fill relativistic.io form with Form 470 data
- `npm run automation:ruckus -- <application-number>` - Fill Ruckus partner portal deal registration with Form 470 data

## Architecture Overview

This codebase implements a three-layer architecture for E-Rate Form 470 automation:

### 1. Data Access Layer (`/airtable/`)
- **AirtableService**: Generic wrapper providing CRUD operations for any Airtable base
- **Form470DAO**: Domain-specific queries for Form 470 data (hardcoded to base `app742LUED30ISmmF`, table `tblPRqxmCUOo09XCP`)
- **Type Definitions**: Strongly typed interfaces matching the Form 470 schema

### 2. Automation Layer (`/automations/`)
- Playwright-based scripts that combine data access with web automation
- Pattern: Fetch data from Airtable → Transform → Fill web forms
- Uses Chrome browser with human-like delays (100-200ms between actions)

### 3. Test Layer (`/tests/`)
- Playwright end-to-end tests
- Configuration supports Chromium, Firefox, and WebKit
- HTML reports generated in `/playwright-report/`

## Key Integration Points

**Airtable Connection:**
- Requires `AIRTABLE_API_KEY` in `.env` file
- Form470DAO connects to specific E-Rate base/table
- All Airtable operations return typed TypeScript objects

**Automation Pattern:**
```typescript
// 1. Get data from Airtable
const dao = new Form470DAO(apiKey);
const form470 = await dao.get470ByApplicationNumber(appNumber);

// 2. Transform data
const contactData = {
  name: form470.fields['Contact Name'],
  email: form470.fields['Contact Email'],
  // ... map other fields
};

// 3. Automate web interaction
const browser = await chromium.launch({ channel: 'chrome' });
// ... fill form with contactData
```

## Development Patterns

**Adding New Airtable DAOs:**
1. Create new DAO class in `/airtable/dao/`
2. Extend base AirtableService
3. Add domain-specific methods
4. Define TypeScript interfaces in `types.ts`

**Creating New Automations:**
1. Add TypeScript file to `/automations/`
2. Import Form470DAO or other DAOs as needed
3. Use Playwright with Chrome channel
4. Add script to package.json
5. Include random delays for human-like behavior

**TypeScript Configuration:**
- ES2022 target with ES modules
- Strict mode enabled
- Source maps for debugging
- Includes `airtable/**/*` and `tests/**/*`