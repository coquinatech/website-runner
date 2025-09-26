// Form 471 attachment interface
export interface Form471Attachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
  };
}

// Form 470 fields based on the actual data shape
export interface Form470Fields {
  'Title': string;
  'Application Number': string;
  'Buyer': string;
  'State': string;
  'Level': string;
  'Date': string;
  'Status': string;
  'Funding Year': string;
  'Total Pre Discount Funding': number;
  'Total Funding Commitment': number;
  'Urban/Rural Status': string;
  'Category 1 Discount Rate': number;
  'Category 2 Discount Rate': number;
  'Contact Name': string;
  'Contact Email': string;
  'Contact Phone Number': string;
  'Funding Narrative': string;
  'Funding Request Number': string;
  'Service Provider Name': string;
  'Service Provider Number': string;
  'Establishing 470': string;
  'Service Dates': string;
  'Term of Service': string;
  'Form 471': Form471Attachment[];
  'Categories': string;
  'Link': string;
  'Created': string;
  'Size': number;
  'Extracted Text': string;
  'Line Items JSON': string;
  'Extraction Date': string;
  'Extraction Status': string;
  'Test Extraction Status'?: string;
}

// Form 470 record interface
export interface Form470Record {
  id: string;
  fields: Form470Fields;
  createdTime: string;
}

// Parsed line items structure
export interface LineItems {
  [manufacturer: string]: {
    [productType: string]: number;
  };
}