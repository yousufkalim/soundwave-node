/**
 * All api routes handles here
 * @author Yousuf Kalim
 */
import { Router } from 'express';
// import adminRoutes from './admins.route';
// import userRoutes from './users.route';
import authRoutes from './auth.route';
import cartRoutes from './cart.route';
import checkoutRoutes from '@routes/checkout.route';
const router = Router();

// Parent Routes
// router.use('/admins', adminRoutes); // All the user routes
// router.use('/users', userRoutes); // All the user routes
router.use('/auth', authRoutes); // All the auth routes
router.use('/cart', cartRoutes); // All the cart routes
router.use('/checkout', checkoutRoutes); // All checkout routes

// Export
export default router;
