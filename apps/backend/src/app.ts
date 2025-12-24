import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import tradingRoutes from './routes/trading.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/user', userRoutes);

// Base
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running...',
  });
});

export default app;