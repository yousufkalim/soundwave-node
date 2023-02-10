/**
 * User auth routes
 * @author Rana Ameer Hamza
 */
import { Router } from 'express';
import { GetToken } from '@controllers/auth.controller';

const router = Router();

/**
 * @method get getting access token from spotify
 */

// Routes
router.get('/get-token', GetToken);

// Export
export default router;
