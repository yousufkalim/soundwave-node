/**
 * Auth controllers
 * @author Rana Ameer Hamza
 */
import { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_GET_TOKEN_URL } from '@config';

/**
 * Getting access token
 * @param {object} _req
 * @param {object} res
 */

export const GetToken = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const auth = `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
      'base64',
    )}`;
    const authData = { grant_type: 'client_credentials' };
    const authOptions = {
      url: SPOTIFY_GET_TOKEN_URL,
      headers: { Authorization: auth },
      data: qs.stringify(authData),
      method: 'POST',
    };

    const result = await axios(authOptions);
    return res.status(200).json({ success: true, accessToken: result.data.access_token });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
