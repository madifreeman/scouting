import Airtable from 'airtable';

export const airtableClient = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  'app6qfrezm4DQ9D3A'
);  // TODO: use env var