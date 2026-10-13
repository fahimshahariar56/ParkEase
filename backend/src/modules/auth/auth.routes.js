import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateRegister, validateLogin } from './auth.validation.js';
import { authenticate } from '../../middleware/authenticate.js';

export const authRouter = Router();

// Public Authentication Endpoints
authRouter.post('/register', validateRegister, authController.register);
authRouter.post('/login', validateLogin, authController.loginCustomer);
authRouter.post('/customer/login', validateLogin, authController.loginCustomer);
authRouter.post('/admin/login', validateLogin, authController.loginAdmin);

// Protected Current User Endpoint
authRouter.get('/me', authenticate, authController.getMe);
