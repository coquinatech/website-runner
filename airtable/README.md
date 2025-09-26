# Airtable Service Wrapper

A simple Node.js wrapper for the Airtable API that provides easy-to-use methods for common operations.

## Installation

Make sure you have the Airtable SDK installed:
```bash
npm install airtable
```

## Usage

```javascript
import AirtableService from './airtableService.js';

const airtable = new AirtableService('your-api-key', 'your-base-id');
```

## Available Methods

### getAllRecords(tableName, options)
Get all records from a table with optional filtering and sorting.

### getRecord(tableName, recordId)
Get a single record by ID.

### createRecord(tableName, fields)
Create a new record with the specified fields.

### createRecords(tableName, recordsArray)
Create multiple records in a single request.

### updateRecord(tableName, recordId, fields)
Update specific fields of an existing record.

### updateRecords(tableName, updates)
Update multiple records in a single request.

### deleteRecord(tableName, recordId)
Delete a single record.

### deleteRecords(tableName, recordIds)
Delete multiple records.

### replaceRecord(tableName, recordId, fields)
Replace all fields of an existing record.

### findRecordByField(tableName, fieldName, value)
Find the first record where a specific field matches a value.

### findRecordsByFormula(tableName, formula)
Find records using an Airtable formula.

## Environment Variables

Set these environment variables before running:
- `AIRTABLE_API_KEY`: Your Airtable API key
- `AIRTABLE_BASE_ID`: Your Airtable base ID

## Example

See `example.js` for a complete usage example.