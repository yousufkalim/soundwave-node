/* eslint-disable import/no-duplicates */
/* eslint-disable no-duplicate-imports */
/**
 * Cart controllers
 * @author Rana Ameer Hamza
 */
import { Request, Response } from 'express';
import ICart from '@interfaces/poster.interface';
//  import Poster from '@interfaces/poster.interface'
import Cart from '@models/cart.model';
import * as fs from 'fs';
import path from 'path';
// import path from 'path';
/**
 * @param {object} _req
 * @param {object} res
 */

export const addPosterToCart = async (req: Request, res: Response): Promise<Response> => {
  const body: ICart = req.body;
  try {
    const dateTime = Date.now();
    const existingCart = body.cartId;
    if (existingCart) {
      const cart = await Cart.findById(existingCart);
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }
      const buff = body.totalPoster[0].posterImage.replace('data:image/png;base64', '');
      const buf = Buffer.from(buff, 'base64');
      const fileRefPath = path.join(__dirname, '../..');
      if (!fs.existsSync(fileRefPath)) {
        fs.mkdir(fileRefPath, { recursive: true }, (err) => {
          if (err) {
            return console.error(err);
          }
          console.log('Directory created successfully!');
        });
      }

      const imagePath =
        '/uploads/' +
        body.totalPoster[0].albumName.replace(/[^a-zA-Z0-9]+/g, '') +
        `${dateTime}` +
        '.png';

      // const imagePath =
      //   '/uploads/' + body.totalPoster[0].albumName.replace(' ', '') + `${dateTime}` + '.png';
      fs.writeFileSync(fileRefPath + imagePath, buf, 'base64');
      body.totalPoster[0].posterImage = imagePath;

      const updatedCart = await Cart.findByIdAndUpdate(
        cart._id,
        {
          totalPrice: +cart.totalPrice + +body.totalPoster.reduce((a, b) => +a + +b.totalPrice, 0),
          $push: {
            totalPoster: { $each: body.totalPoster },
          },
        },
        { new: true },
      );

      return res.status(200).json({ success: true, cart: updatedCart });
    }
    body.totalPrice = body?.totalPoster?.reduce((a, b) => +a + +b.totalPrice, 0);
    body.shippingCost = 0;
    const buff = body.totalPoster[0].posterImage.replace('data:image/png;base64', '');
    const buf = Buffer.from(buff, 'base64');
    const fileRefPath = path.join(__dirname, '../..');
    if (!fs.existsSync(fileRefPath)) {
      fs.mkdir(fileRefPath, { recursive: true }, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Directory created successfully!');
      });
    }

    const imagePath =
      '/uploads/' +
      body.totalPoster[0].albumName.replace(/[^a-zA-Z0-9]+/g, '') +
      `${dateTime}` +
      '.png';
    // const imagePath =
    //   '/uploads/' + body.totalPoster[0].albumName.replace(' ', '') + `${dateTime}` + '.png';
    fs.writeFileSync(fileRefPath + imagePath, buf, 'base64');
    body.totalPoster[0].posterImage = imagePath;

    const cart = await Cart.create(body);
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllPoster = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const changePosterQuantity = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const { posterId, unitPrice, quantity, isAdd } = req.body;
    if (!posterId) {
      return res.status(404).json({ success: false, message: 'Poster not found in cart' });
    }
    // const totalPosterPrice = unitPrice * quantity;
    const updatedCart = await Cart.findOneAndUpdate(
      { _id: cart._id, 'totalPoster._id': posterId },
      {
        $set: {
          'totalPoster.$.posterQuantity': quantity,
          'totalPoster.$.totalPrice': unitPrice * quantity,
          totalPrice: isAdd ? cart.totalPrice + +unitPrice : cart.totalPrice - +unitPrice,
        },
      },
      { new: true },
    );

    return res.status(200).json({ success: true, cart: updatedCart });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deletePosterFromCart = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  try {
    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const poster = cart.totalPoster.find((item) => {
      return item?._id?.toString() === req.body.posterId;
    });

    if (!poster) {
      return res.status(404).json({ success: false, message: 'Poster not found in cart' });
    }

    const filePath = path.join(__dirname, '../..') + poster.posterImage;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File has been removed');
    });

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: cart._id },
      {
        $pull: { totalPoster: { _id: poster._id } },
        $set: {
          totalPrice: cart.totalPrice - +poster.totalPrice,
        },
      },

      { new: true },
    );

    return res.status(200).json({ success: true, cart: updatedCart });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
