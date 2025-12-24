import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const ENV = {
  PORT: process.env.PORT || 8080,
  REDIS_URL: process.env.REDIS_URL || 'xyz',
  JWT_SECRET: process.env.JWT_SECRET || 'xyz',
};

export default ENV;