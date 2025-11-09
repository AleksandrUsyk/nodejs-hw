import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';

export const authRouter = express.Router();

authRouter.post(
  '/register',
  celebrate({ [Segments.BODY]: registerUserSchema }),
  registerUser,
);

authRouter.post(
  '/login',
  celebrate({ [Segments.BODY]: loginUserSchema }),
  loginUser,
);

authRouter.post('/refresh', refreshUserSession);

authRouter.post('/logout', logoutUser);
