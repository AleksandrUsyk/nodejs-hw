// src/routes/authRoutes.js
import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

export const authRouter = express.Router();

authRouter.post(
  '/register',
  celebrate({ [Segments.BODY]: registerUserSchema.body || registerUserSchema }),
  registerUser,
);

authRouter.post(
  '/login',
  celebrate({ [Segments.BODY]: loginUserSchema.body || loginUserSchema }),
  loginUser,
);

authRouter.post('/refresh', refreshUserSession);
authRouter.post('/logout', logoutUser);

// NEW: request reset email
authRouter.post(
  '/request-reset-email',
  celebrate({
    [Segments.BODY]: requestResetEmailSchema.body || requestResetEmailSchema,
  }),
  requestResetEmail,
);

// NEW: reset password
authRouter.post(
  '/reset-password',
  celebrate({
    [Segments.BODY]: resetPasswordSchema.body || resetPasswordSchema,
  }),
  resetPassword,
);
