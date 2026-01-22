import express from 'express';

const router = express.Router();

import { signup, signin, getUsers } from './users.controllers';
import { authenticate } from '../../middlewares/auth';

// Public routes - no authentication needed
router.post('/signup', signup);
router.post('/signin', signin);

// Protected route - require authentication
router.get('/users', authenticate, getUsers);

export default router;