import { createHmac } from 'node:crypto';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function printUsage() {
  console.log(
    'Usage: npm run create:upload-token -- <invite-id> <expires-at-iso>',
  );
}

const secret = process.env.UPLOAD_ACCESS_SECRET;
if (!secret) {
  console.error('Missing UPLOAD_ACCESS_SECRET');
  process.exit(1);
}

const inviteId = process.argv[2];
const expiresAtIso = process.argv[3];

if (!inviteId || !expiresAtIso) {
  printUsage();
  process.exit(1);
}

const expiresAt = Date.parse(expiresAtIso);
if (Number.isNaN(expiresAt)) {
  console.error('Invalid expiration date. Use an ISO timestamp.');
  process.exit(1);
}

const payload = {
  inviteId,
  expiresAt,
};
const encodedPayload = Buffer.from(
  JSON.stringify(payload),
  'utf8',
).toString('base64url');
const signature = createHmac('sha256', secret)
  .update(encodedPayload)
  .digest('base64url');

console.log(`${encodedPayload}.${signature}`);
