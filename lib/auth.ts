import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-sikabid-2026-very-secure';

/**
 * Hash a plain password using PBKDF2.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain password against a stored PBKDF2 hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === testHash;
}

export interface SessionPayload {
  userId: number;
  username: string;
  nama: string;
  role: string;
}

/**
 * Create a simple cryptographically signed session token.
 * Format: base64url(payload) + "." + base64url(hmac-sha256(payload, secret))
 */
export function createSessionToken(payload: SessionPayload): string {
  const payloadStr = JSON.stringify({
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days expiration
  });
  const encodedPayload = Buffer.from(payloadStr).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(encodedPayload);
  const signature = hmac.digest('base64url');
  
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token) return null;
  
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [encodedPayload, signature] = parts;
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(encodedPayload);
  const expectedSignature = hmac.digest('base64url');
  
  // Safe comparison
  if (signature !== expectedSignature) return null;
  
  try {
    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }
    
    return {
      userId: payload.userId,
      username: payload.username,
      nama: payload.nama,
      role: payload.role
    };
  } catch {
    return null;
  }
}
