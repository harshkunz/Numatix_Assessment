import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { createBinanceClient } from '../services/binanceClient';
import { decrypt } from '../utils/crypto';

export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.binanceApiKey || !user.binanceSecretKey) {
      return res.status(400).json({ message: 'Binance API keys not configured for this user' });
    }

    const binanceClient = createBinanceClient(
      decrypt(user.binanceApiKey),
      decrypt(user.binanceSecretKey)
    );

    const accountResponse = await binanceClient.account();
    const account = accountResponse.data;

    const usdt = account.balances.find((b: any) => b.asset === 'USDT');

    const accountDetails = {
      marginRatio: parseFloat(account.marginRatio ?? '0'),
      maintenanceMargin: parseFloat(account.maintenanceMargin ?? '0'),
      marginBalance: parseFloat(usdt?.free ?? '0'),
    };

    return res.json(accountDetails);
  } catch (error: any) {
    console.error('Error fetching account details:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch account details' });
  }
};
