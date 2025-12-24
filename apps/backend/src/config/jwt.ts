import jwt, { JwtPayload } from 'jsonwebtoken';
import ENV from './env';

const JWT_SECRET = ENV.JWT_SECRET!;

export interface JwtUserPayload extends JwtPayload {
  id: number;
  email: string;
}

export const signToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
};

export const verifyToken = (token: string): JwtUserPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }

  return decoded as JwtUserPayload;
};
