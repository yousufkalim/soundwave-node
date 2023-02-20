/**
 * Checkout routes
 * @author Yousuf Kalim
 */
import { Router } from 'express';
import { createCheckout } from '@controllers/checkout.controller';

const router = Router();

/**
 * @method post
 */

router.post('/:cartId', createCheckout);

// Export
export default router;
