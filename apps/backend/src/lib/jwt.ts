import jwt from 'jsonwebtoken';
import { Role } from '../models/Employee';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return secret;
};

export function signToken(payload: JwtPayload, expiresIn = '8h'): string {
  return jwt.sign(payload, getSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}
