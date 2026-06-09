import { createHmac, timingSafeEqual } from 'node:crypto';

export const UPLOAD_ACCESS_COOKIE_NAME = 'wedding_upload_access';

export type UploadAccessPayload = {
  expiresAt: number;
  inviteId: string;
};

function getUploadAccessSecret() {
  const secret = process.env.UPLOAD_ACCESS_SECRET;
  if (!secret) {
    throw new Error('Missing UPLOAD_ACCESS_SECRET');
  }

  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload: string) {
  return createHmac('sha256', getUploadAccessSecret())
    .update(payload)
    .digest('base64url');
}

export function createUploadAccessToken(payload: UploadAccessPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyUploadAccessToken(token: string) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const providedSignature = Buffer.from(signature, 'utf8');
  const actualSignature = Buffer.from(expectedSignature, 'utf8');

  if (
    providedSignature.length !== actualSignature.length ||
    !timingSafeEqual(providedSignature, actualSignature)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as Partial<UploadAccessPayload>;

    if (
      typeof parsed.inviteId !== 'string' ||
      parsed.inviteId.length === 0 ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    return {
      expiresAt: parsed.expiresAt,
      inviteId: parsed.inviteId,
    } satisfies UploadAccessPayload;
  } catch {
    return null;
  }
}

export function getUploadAccessFromCookieValue(token?: string) {
  if (!token) return null;
  return verifyUploadAccessToken(token);
}
