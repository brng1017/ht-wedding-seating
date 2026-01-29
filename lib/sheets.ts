import { google } from 'googleapis';

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) throw new Error('Missing GOOGLE_PRIVATE_KEY');
  return key.replace(/\\n/g, '\n');
}

export async function fetchGuestsFromSheet() {
  const sheetId = process.env.GOOGLE_SHEETS_ID!;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = getPrivateKey();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const range = 'Guests!A:Z';

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => String(h).trim().toLowerCase());
  const data = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (r[i] ?? '').toString().trim()));
    return obj;
  });

  return data
    .filter((g) => g.name && g.table)
    .map((g) => ({
      name: g.name,
      table: g.table,
      party: g.party ?? '',
      notes: g.notes ?? '',
    }));
}
