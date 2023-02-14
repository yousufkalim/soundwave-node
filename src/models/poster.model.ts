/**
 * User schema
 * @author Yousuf Kalim
 */
import { model, Schema, Document } from 'mongoose';
import Poster from '@interfaces/poster.interface';

// Schema
const posterSchema = new Schema(
  {
    albumName: {
      type: String,
      required: true,
    },
    singerName: {
      type: String,
      required: true,
    },
    frame: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    canvasSize: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    posterImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Model
export default model<Poster & Document>('Poster', posterSchema);
