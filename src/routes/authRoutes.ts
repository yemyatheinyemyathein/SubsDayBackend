import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', auth, getMe);
router.post('/logout', logout);

export default router;
