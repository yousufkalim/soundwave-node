/**
 * User schema
 * @author Rana Ameer Hamza
 */
import { model, Schema, Document } from 'mongoose';
import Cart from '@interfaces/cart.interface';

// Schema
const cartSchema = new Schema(
  {
    totalPoster: [
      {
        albumName: {
          type: String,
          required: true,
        },
        singerName: {
          type: String,
          required: true,
        },
        posterType: {
          type: String,
          required: true,
        },
        size: {
          value: { type: String, required: true },
          unit: { type: String, required: true },
        },
        unitPrice: {
          type: Number,
          required: true,
        },

        totalPrice: {
          type: Number,
          required: true,
        },
        posterImage: {
          type: String,
          required: true,
        },
        posterQuantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
    },
    shippingCost: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

// Model
export default model<Cart & Document>('Cart', cartSchema);
