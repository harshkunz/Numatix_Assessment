import jwt from 'jsonwebtoken';
import ENV from './env';

export const verifyJWT = (token: string) => {
  return jwt.verify(token, ENV.JWT_SECRET);
}