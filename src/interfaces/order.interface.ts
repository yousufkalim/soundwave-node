/**
 * User interfaces - Where we define all the interfaces for cart
 * @author Rana Ameer Hamza
 */

import Poster from './poster.interface';

export default interface Order {
  Posters: Poster[];
  totalPrice: number;
  shippingCost: number;
  userId: string;
  cartId: string;
}
