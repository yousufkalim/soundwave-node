/**
 * Auth controllers
 * @author Rana Ameer Hamza
 */
import { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';

const ENV = process.env;

/**
 * Getting access token
 * @param {object} _req
 * @param {object} res
 */

export const GetToken = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const auth = `Basic ${Buffer.from(
      `${ENV.SPOTIFY_CLIENT_ID}:${ENV.SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64')}`;
    const authData = { grant_type: 'client_credentials' };
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { Authorization: auth },
      data: qs.stringify(authData),
      method: 'POST',
    };

    const result = await axios(authOptions);
    const accessToken = result.data.access_token;
    return res.status(200).json({ success: true, accessToken });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
