---

Created Date: 2025-09-26

# Feature Plan: Convert Ruckus Partner Portal Test to Data-Driven Automation

# Overview

We need to convert the hardcoded Playwright test in `tests/test-3.spec.ts` into a data-driven automation similar to the `automations/relativistic-reach-out.ts` pattern. The current test manually fills out a Ruckus Wireless partner portal deal registration form with hardcoded values. The goal is to replace these hardcoded values with data from Airtable Form470 records, making it a reusable automation tool that can process any E-Rate Form470 opportunity.

# Outcomes

- Convert hardcoded test values to Airtable-sourced data
- Create a reusable automation script that accepts Form470 application numbers
- Follow the established pattern of data retrieval → transformation → form filling
- Maintain the same reliability and functionality as the original test
- Process single Form470 application numbers (no batch processing)
- Add proper error handling and logging for production use

# Open Questions

[x] Should we handle Ruckus portal credentials via environment variables or a separate credential management system?

Keep hardcoded for now

[x] How should we handle missing address data in Form470 records (street, city, zip)? Should we use a default address, skip those fields, or fetch from an external service?

Leave blank

[x] What should be the default job title when Contact Name doesn't provide enough information to extract a title?

Authorized Person

[x] Should we add validation to ensure Form470 records have the minimum required fields before attempting automation?

Yes

[x] Do we want to support batch processing multiple application numbers in a single run?

No

[x] Should we add screenshot/logging capabilities for audit trails when deals are registered?

Yes, screenshot every page before submission

# Tasks

[ ] Create new automation script following the established pattern in `/automations/`

[ ] Define interface for Ruckus deal registration data structure

[ ] Implement data transformation function to map Form470 fields to Ruckus form fields

[ ] Handle authentication credentials (hardcoded for now)

[ ] Implement customer search logic using Form470 Buyer field

[ ] Map address fields (leave blank if missing data)

[ ] Extract and map contact information from Form470 Contact fields

[ ] Map E-Rate specific fields (funding year, deal value, project details)

[ ] Add proper error handling and logging throughout the automation

[ ] Create command line interface accepting application numbers

[ ] Add npm script to package.json for easy execution

[ ] Test automation with real Form470 data

[ ] Add comprehensive logging for successful and failed operations

[ ] Add screenshot functionality for audit trail (final form state before potential submission)

[ ] Ensure automation stops at form completion WITHOUT submitting (for manual review)

[ ] Add validation for minimum required Form470 fields

[ ] Remove original test file after successful migration

[ ] Update CLAUDE.md documentation with new automation command

# Security

**Credential Management**: Ruckus portal credentials will be hardcoded for now as requested. Future enhancement could move to environment variables.

**Data Validation**: Validate Form470 data before sending to external portal to prevent injection attacks or malformed submissions.

**Audit Logging**: Log all automation attempts with timestamps, application numbers, and outcomes for audit compliance.

**Form Submission**: Automation will fill the form completely but NOT submit, allowing for manual review before actual submission.

**Rate Limiting**: Implement delays between actions to avoid triggering anti-automation defenses on the Ruckus portal.

# Data Mapping Strategy

## Direct Mappings Available
- **Contact Email**: Form470 `Contact Email` → Ruckus login username
- **Customer Name**: Form470 `Buyer` → Ruckus customer search
- **State**: Form470 `State` → Ruckus state field
- **Contact Phone**: Form470 `Contact Phone Number` → Ruckus phone field
- **Contact Email**: Form470 `Contact Email` → Ruckus contact email
- **Funding Year**: Form470 `Funding Year` → Ruckus E-Rate funding year
- **Deal Value**: Form470 `Total Funding Commitment` → Ruckus estimated deal value

## Derived/Constructed Mappings
- **Contact Name**: Split Form470 `Contact Name` into first/last name
- **Project Name**: Construct from `"E-Rate Opportunity with " + Form470.Buyer`
- **Project Description**: Construct from Form470 `Title` + `Funding Narrative`
- **Help Description**: Use Form470 `Funding Narrative` for partner comments

## Missing Data Handling
- **Street Address**: Leave blank if not available in Form470
- **City/Zip**: Leave blank if not available in Form470
- **Contact Title**: Use "Authorized Person" as default
- **Login Credentials**: Hardcoded in automation script for now

# Implementation Pattern

```typescript
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
```