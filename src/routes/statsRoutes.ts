import { Router } from 'express';
import { getStats } from '../controllers/statsController';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, getStats);
 
export default router;