import { OAuth2Client } from 'google-auth-library';

let client;

/** True when Google sign-in is configured (GOOGLE_CLIENT_ID from the Google Cloud console). */
export const googleEnabled = () => Boolean(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google Identity Services ID token (the "credential" of the Sign in with Google button).
 * Checks signature, expiry and audience; returns the profile, or throws.
 */
export async function verifyGoogleCredential(credential) {
  client ||= new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  const p = ticket.getPayload();
  if (!p?.sub || !p.email) throw new Error('Invalid Google token');
  return {
    googleId: p.sub,
    email: p.email.toLowerCase(),
    emailVerified: p.email_verified === true,
    fullName: p.name || p.email.split('@')[0],
    picture: p.picture || '',
  };
}
