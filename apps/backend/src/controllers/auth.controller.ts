import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { signToken } from '../config/jwt';
import { prisma } from '../config/db';
import { encrypt } from '../utils/crypto';
import { redis } from '../config/redis';

export const register = async (req: Request, res: Response) => {
  const { email, password, binanceApiKey, binanceSecretKey } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedApiKey = encrypt(binanceApiKey);
  const encryptedSecretKey = encrypt(binanceSecretKey);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      binanceApiKey: encryptedApiKey,
      binanceSecretKey: encryptedSecretKey,
    },
  });

  await redis.set(`user:${user.id}:apiKey`, encryptedApiKey);
  await redis.set(`user:${user.id}:apiSecret`, encryptedSecretKey);

  const token = signToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = signToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email } });
};

export const logout = async (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
};