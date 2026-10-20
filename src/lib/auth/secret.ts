export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set. Refusing to start with a fallback secret.');
  }
  return secret;
}
