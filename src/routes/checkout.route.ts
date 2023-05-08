/**
 * Checkout routes
 * @author Yousuf Kalim
 */
import { Router } from 'express';
import {
  createCheckout,
  //  CreateGelatoOrder,
  webhook,
} from '@controllers/checkout.controller';

const router = Router();

/**
 * @method post
 */

// router.post('/CreateGelatoOrder', CreateGelatoOrder);
router.post('/webhook', webhook);
router.post('/:cartId', createCheckout);

// Export
export default router;
