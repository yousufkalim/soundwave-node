/**
 * User interfaces - Where we define all the interfaces for cart
 * @author Rana Ameer Hamza
 */

interface Isize {
  value: string;
  unit: string;
}

interface Iframe {
  frameType: string;
  selectedFrame: string;
}

export interface Poster {
  albumName: string;
  singerName: string;
  frame: Iframe;
  size: Isize;
  unitPrice: number;
  totalPrice: number;
  posterImage: string;
  posterQuantity: number;
  _id?: string;
}

export default interface ICart {
  totalPoster: Poster[];
  cartId?: string;
  totalPrice?: number;
  shippingCost?: number;
}
