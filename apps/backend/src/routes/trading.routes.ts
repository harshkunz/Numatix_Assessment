import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { placeOrder, getOrders, getPositions, getTrades } from '../controllers/trading.controller';

const router = Router();

router.post('/orders', authenticateJWT, placeOrder);
router.get('/orders', authenticateJWT, getOrders);
router.get('/positions', authenticateJWT, getPositions);
router.get('/trades', authenticateJWT, getTrades);

export default router;