/**
 * All the validation
 * @author Rana Ameer Hamza
 */
import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

/*
====================
Validations
====================
*/

// You can create multiple validations strategies (Read express-validator documentation for more details)

// Add poster to cart
export const validatePoster = [
  check('totalPoster').isArray().withMessage('totalPoster must be array'),
  check('totalPoster.*.albumName', 'Album Name is required.').notEmpty().trim(),
  check('totalPoster.*.singerName', 'Singer Name is required.').notEmpty().trim(),
  check('totalPoster.*.frame.frameType', 'Frame type is required.').notEmpty().trim(),
  check('totalPoster.*.size.value', 'Frame size is required.').notEmpty().trim(),
  check('totalPoster.*.size.unit', 'Size unit is required.').notEmpty().trim(),
  check('totalPoster.*.unitPrice', 'Unit price is required.').notEmpty().trim().isNumeric(),
  check('totalPoster.*.totalPrice', 'Total price is required.').notEmpty().trim().isNumeric(),
  check('totalPoster.*.posterImage', 'posterImage is required.').notEmpty().trim(),
  check('totalPoster.*.posterQuantity', 'Poster quantity is required.')
    .notEmpty()
    .trim()
    .isNumeric(),
];

export const validatePosterQuantity = [
  check('posterId', 'PosterId is required.').notEmpty().trim(),
  check('quantity', 'Poster quantity is required.').notEmpty().trim().isNumeric(),
  check('unitPrice', 'Poster unit price is required.').notEmpty().trim().isNumeric(),
];

export const validatePosterDelete = [check('posterId', 'PosterId is required.').notEmpty().trim()];
/*
======================
Result
======================
*/

/**
 * To check if request validated successfully or not, according to our validation strategies
 * @param {object} req
 * @param {object} res
 * @param {*} next
 */
export const isValidated = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req); // Validating the request by previous middleware's strategy
  if (!errors.isEmpty()) {
    // On error
    return res.status(400).send({ success: false, message: errors.array()[0].msg }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
