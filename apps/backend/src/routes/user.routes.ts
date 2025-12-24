import { Router } from "express";
import { getAccountDetails } from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get('/account', authenticateJWT, getAccountDetails);

export default router;
