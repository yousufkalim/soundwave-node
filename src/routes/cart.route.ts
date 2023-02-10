/**
 * User auth routes
 * @author Rana Ameer Hamza
 */
import { Router } from 'express';
import {
  addPosterToCart,
  getAllPoster,
  changePosterQuantity,
  deletePosterFromCart,
} from '@controllers/cart.controller';
import { validatePoster, isValidated } from '@middleware/validations.middleware';

const router = Router();

/**
 * @method get
 */

router.get('/:id', getAllPoster);
/**
 * @method post
 */
router.post('/add-poster', validatePoster, isValidated, addPosterToCart);
/**
 * @method patch
 */
router.patch('/changePosterQuantity/:id', changePosterQuantity);
router.patch('/deletePoster/:id', deletePosterFromCart);

// Export
export default router;
