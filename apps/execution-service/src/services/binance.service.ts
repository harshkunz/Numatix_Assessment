// binance.service.ts
const { Spot } = require('@binance/connector');

export const createBinanceClient = (apiKey: string, apiSecret: string) => {
  return new Spot(apiKey, apiSecret, {
    baseURL: 'https://testnet.binance.vision', 
  });
};
