import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const ENV = {
    PORT: process.env.PORT || 7001,
    JWT_SECRET: process.env.JWT_SECRET || 'xyz',
    DATABASE_URL: process.env.DATABASE_URL || 'abc',
    REDIS_URL: process.env.REDIS_URL || 'abc',
    ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || 'xyzabc'
};

export default ENV;