import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyToken(token);
    req.user = user;              
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
