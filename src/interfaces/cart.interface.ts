/**
 * User interfaces - Where we define all the interfaces for cart
 * @author Rana Ameer Hamza
 */

import { Poster } from './poster.interface';

export default interface Cart {
  totalPoster: Poster[];
  totalPrice: number;
  shippingCost: number;
}
