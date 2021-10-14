import Airtable from 'airtable';

export const airtableClient = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  'appQUfrKBBc89xFrC'
);  // TODO: use env var