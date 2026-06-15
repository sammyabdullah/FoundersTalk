import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'foundertalk-secret-change-me')
const COOKIE = 'ft_session'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(founderId: string) {
  const token = await new SignJWT({ sub: founderId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
  return token
}

export async function getSession(): Promise<string | null> {
  const cookie = cookies().get(COOKIE)
  if (!cookie) return null
  try {
    const { payload } = await jwtVerify(cookie.value, SECRET)
    return payload.sub as string
  } catch {
    return null
  }
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

export function clearSessionCookie() {
  cookies().delete(COOKIE)
}
