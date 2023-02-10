/**
 * User auth routes
 * @author Yousuf Kalim
 */
import { Router } from 'express';
import { GetToken } from '@controllers/auth.controller';
// import { checkUserAuth } from '@middleware/auth.middleware';

const router = Router();

/**
 * ////////////////////////// Routes /////////////////////////
 * @method get getting access token from spotify
 */

// Routes
router.get('/get-token', GetToken);

// Export
export default router;
