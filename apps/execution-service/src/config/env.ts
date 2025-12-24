import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const ENV = {
    DATABASE_URL: process.env.DATABASE_URL || 'abc',
    REDIS_URL: process.env.REDIS_URL || 'abc',
    ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || 'xyzabc'
};

export default ENV;