import app from './app';
import ENV  from './config/env';
import { redis } from './config/redis';


process.on('SIGINT', async () => {
  console.log('Shutting down: closing Redis...');
  try {
    await redis.quit();
    console.log('Redis closed');
  } catch (err) {
    console.error('Error closing Redis', err);
  } finally {
    process.exit(0);
  }
});

const PORT = ENV.PORT || 7000;

async function start() {
  try {
    await redis.ping();
    console.log('Redis OK');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Check http://localhost:${PORT}`);
    });
  } 
  
  catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();