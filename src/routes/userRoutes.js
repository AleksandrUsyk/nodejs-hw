import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
import {
  updateUserAvatar,
  getCurrentUser,
} from '../controllers/userController.js';

const router = Router();

// GET /users/me
router.get('/users/me', authenticate, getCurrentUser);

// PATCH /users/me/avatar
router.patch(
  '/users/me/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
);

export default router;
