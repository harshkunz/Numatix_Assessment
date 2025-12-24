import crypto from 'crypto';
import ENV from '../config/env';

const ALGORITHM = 'aes-256-ctr';

export const encrypt = (plain: string) => {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ENV.ENCRYPTION_SECRET).digest();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};


export const decrypt = (encrypted: string) => {
  const [ivHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');

  const key = crypto.createHash('sha256').update(ENV.ENCRYPTION_SECRET).digest();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

  return decrypted.toString('utf8');
};