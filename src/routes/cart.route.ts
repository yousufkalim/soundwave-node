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
import {
  validatePoster,
  validatePosterQuantity,
  validatePosterDelete,
  isValidated,
} from '@middleware/validations.middleware';

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
router.put('/changePosterQuantity/:id', validatePosterQuantity, isValidated, changePosterQuantity);
router.put('/deletePoster/:id', validatePosterDelete, isValidated, deletePosterFromCart);

// Export
export default router;
