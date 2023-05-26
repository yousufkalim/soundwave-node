/**
 * Checkout controllers
 * @author Yousuf Kalim
 */
import { Request, Response } from 'express';
import { Product, ProductVariant } from 'shopify-api-types';
import Cart from '@models/cart.model';
import axios, { AxiosResponse } from 'axios';

// Load environment variables
import {
  SHOPIFY_SHOP,
  SHOPIFY_ADMIN_ACCESS_TOKEN_TOKEN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  GELATO_API_KEY,
  GELATO_URL,
  HOST,
} from '@config';

/**
 * Create checkout
 * @param {object} req
 * @param {object} res
 */
export const createCheckout = async (req: Request, res: Response): Promise<Response> => {
  // Modifying shopify types
  interface IProductVariant extends ProductVariant {
    admin_graphql_api_id: string;
  }
  interface IProduct extends Product {
    variants: IProductVariant[];
  }

  try {
    const { cartId } = req.params;
    const cart = await Cart.findById(cartId);

    if (!cart?.totalPoster?.length) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Create an array of product promises by mapping over each item in the cart
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const productPromises = cart?.totalPoster.map((item) => {
      // Send a POST request to create a new product in Shopify's admin API
      return axios({
        method: 'post',
        url: `https://${SHOPIFY_SHOP}/admin/api/2023-01/products.json`,
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN_TOKEN,
        },
        data: {
          product: {
            title: 'New Custom Order',
            body_html: `
            <p><strong>Generated Image: </strong>https://soundwave-api-dev.falconweb.app${item.posterImage}</p>
            <p><strong>Size: </strong>${item.size.value}</p>
            <p><strong>Type: </strong>${item.posterType}</p>
            <p><strong>Quantity: </strong>${item.posterQuantity}</p>
            <p><strong>Unit Price: </strong>${item.unitPrice}</p>
            <p><strong>Total Price: </strong>${item.totalPrice}</p>
            `,
            product_type: 'Physical Product',
            variants: [
              {
                option1: `${item.size.value} / ${item.posterType}`,
                price: item.unitPrice,
              },
            ],
          },
        },
      });
    });

    // Wait for all product promises to resolve and extract the product data
    const products = (await Promise.all(productPromises)) as Array<
      AxiosResponse<{ product: IProduct }>
    >;

    // Create an array of listing promises by mapping over the product data
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const listings = products.map(({ data }) => {
      // Send a PUT request to update the product listing in Shopify's admin API
      return axios({
        method: 'put',
        url: `https://${SHOPIFY_SHOP}/admin/api/2023-01/product_listings/${data.product.id}.json`,
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN_TOKEN,
        },
      });
    });

    // Wait for all listing promises to resolve so product can be available on app's sales channel
    await Promise.all(listings);

    // Create variants array
    const variants = products.map((_) => _.data?.product.variants[0]?.admin_graphql_api_id);

    // Create line items with variant ids along with quantity
    const lineItems = variants.map((variant, i) => ({
      variantId: variant,
      quantity: cart?.totalPoster[i].posterQuantity,
    }));

    // Convert it to string, so we can append it to GraphQL mutation
    const lineItemsString = lineItems.map(
      (item) => `{ variantId: "${item.variantId}", quantity: ${item.quantity} }`,
    );

    // GraphQL mutation string
    const mutationString = `
      mutation {
        checkoutCreate(input: {
          lineItems: [
            ${lineItemsString.join(',\n')}
          ]
        }) {
          checkout {
            id
            webUrl
          }
        }
      }`;

    // Create checkout api
    const {
      data: {
        data: {
          checkoutCreate: { checkout },
        },
      },
    } = await axios({
      method: 'post',
      url: `https://${SHOPIFY_SHOP}/api/2023-01/graphql.json`,
      headers: {
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      data: {
        query: mutationString,
        variables: {},
      },
    });

    await Cart.findByIdAndUpdate(cartId, {
      checkoutToken: checkout.id.split('?')[0].split('/').pop(),
    });

    // Done dana done

    return res.json({ success: true, checkoutURL: checkout.webUrl });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const webhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const cart = await Cart.findOne({ checkoutToken: req.body.checkout_token });
    const posterUId: Record<string, string> = {
      // if no frame is selected
      '12 X 18 / No Frame': 'flat_300x450-mm-12x18-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '16 X 20 / No Frame': 'flat_400x500-mm-16x20-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '18 X 24 / No Frame': 'flat_450x600-mm-18x24-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '20 X 28 / No Frame': 'flat_500x700-mm-20x28-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '24 X 36 / No Frame': 'flat_600x900-mm-24x36-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '28 X 40 / No Frame': 'flat_700x1000-mm-28x40-inch_170-gsm-65lb-coated-silk_4-0_ver',
      // if black wooden frame is selected
      '12 X 18 / Black Wooden Frame':
        'framed_poster_mounted_300x450-mm-12x18-inch_black_wood_w12xt22-mm_plexiglass_300x450-mm-12x18-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '16 X 20 / Black Wooden Frame':
        'framed_poster_mounted_400x500-mm-16x20-inch_black_wood_w12xt22-mm_plexiglass_400x500-mm-16x20-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '18 X 24 / Black Wooden Frame':
        'framed_poster_mounted_450x600-mm-18x24-inch_black_wood_w12xt22-mm_plexiglass_450x600-mm-18x24-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '20 X 28 / Black Wooden Frame':
        'framed_poster_mounted_500x700-mm-20x28-inch_black_wood_w12xt22-mm_plexiglass_500x700-mm-20x28-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '24 X 36 / Black Wooden Frame':
        'framed_poster_mounted_600x900-mm-24x36-inch_black_wood_w12xt22-mm_plexiglass_600x900-mm-24x36-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '28 X 40 / Black Wooden Frame':
        'framed_poster_mounted_700x1000-mm-28x40-inch_black_wood_w12xt22-mm_plexiglass_700x1000-mm-28x40-inch_170-gsm-65lb-coated-silk_4-0_ver',

      // if Nuteral wooden frame is selected
      '12 X 18 / Nuteral Wooden Frame':
        'framed_poster_mounted_300x450-mm-12x18-inch_natural-wood_wood_w12xt22-mm_plexiglass_300x450-mm-12x18-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '16 X 20 / Nuteral Wooden Frame':
        'framed_poster_mounted_400x500-mm-16x20-inch_natural-wood_wood_w12xt22-mm_plexiglass_400x500-mm-16x20-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '18 X 24 / Nuteral Wooden Frame':
        'framed_poster_mounted_450x600-mm-18x24-inch_natural-wood_wood_w12xt22-mm_plexiglass_450x600-mm-18x24-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '20 X 28 / Nuteral Wooden Frame':
        'framed_poster_mounted_500x700-mm-20x28-inch_natural-wood_wood_w12xt22-mm_plexiglass_500x700-mm-20x28-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '24 X 36 / Nuteral Wooden Frame':
        'framed_poster_mounted_600x900-mm-24x36-inch_natural-wood_wood_w12xt22-mm_plexiglass_600x900-mm-24x36-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '28 X 40 / Nuteral Wooden Frame':
        'framed_poster_mounted_700x1000-mm-28x40-inch_natural-wood_wood_w12xt22-mm_plexiglass_700x1000-mm-28x40-inch_170-gsm-65lb-coated-silk_4-0_ver',

      // if white wooden frame is selected
      '12 X 18 / White Wooden Frame':
        'framed_poster_mounted_300x450-mm-12x18-inch_white_wood_w12xt22-mm_plexiglass_300x450-mm-12x18-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '16 X 20 / White Wooden Frame':
        'framed_poster_mounted_400x500-mm-16x20-inch_white_wood_w12xt22-mm_plexiglass_400x500-mm-16x20-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '18 X 24 / White Wooden Frame':
        'framed_poster_mounted_450x600-mm-18x24-inch_white_wood_w12xt22-mm_plexiglass_450x600-mm-18x24-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '20 X 28 / White Wooden Frame':
        'framed_poster_mounted_500x700-mm-20x28-inch_white_wood_w12xt22-mm_plexiglass_500x700-mm-20x28-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '24 X 36 / White Wooden Frame':
        'framed_poster_mounted_600x900-mm-24x36-inch_white_wood_w12xt22-mm_plexiglass_600x900-mm-24x36-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '28 X 40 / White Wooden Frame':
        'framed_poster_mounted_700x1000-mm-28x40-inch_white_wood_w12xt22-mm_plexiglass_700x1000-mm-28x40-inch_170-gsm-65lb-coated-silk_4-0_ver',

      // if black metal frame is selected
      '12 X 18 / Black Metal Frame':
        'framed_poster_300x450-mm-12x18-inch_black_aluminum_w10xt22-mm_plexiglass_300x450-mm-12x18-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '16 X 20 / Black Metal Frame':
        'framed_poster_400x500-mm-16x20-inch_black_aluminum_w10xt22-mm_plexiglass_400x500-mm-16x20-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '18 X 24 / Black Metal Frame':
        'framed_poster_450x600-mm-18x24-inch_black_aluminum_w10xt22-mm_plexiglass_450x600-mm-18x24-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '20 X 28 / Black Metal Frame':
        'framed_poster_500x700-mm-20x28-inch_black_aluminum_w10xt22-mm_plexiglass_500x700-mm-20x28-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '24 X 36 / Black Metal Frame':
        'framed_poster_600x900-mm-24x36-inch_black_aluminum_w10xt22-mm_plexiglass_600x900-mm-24x36-inch_170-gsm-65lb-coated-silk_4-0_ver',
      '28 X 40 / Black Metal Frame':
        'framed_poster_700x1000-mm-28x40-inch_black_aluminum_w10xt22-mm_plexiglass_700x1000-mm-28x40-inch_170-gsm-65lb-coated-silk_4-0_ver',

      // if thin canvas is selected
      '12 X 18 / Thin Canvas': 'canvas_300x450-mm-12x18-inch_canvas_wood-fsc-slim_4-0_ver',
      '16 X 20 / Thin Canvas': 'canvas_400x500-mm-16x20-inch_canvas_wood-fsc-slim_4-0_ver',
      '18 X 24 / Thin Canvas': 'canvas_450x600-mm-18x24-inch_canvas_wood-fsc-slim_4-0_ver',
      '20 X 28 / Thin Canvas': 'canvas_500x700-mm-20x28-inch_canvas_wood-fsc-slim_4-0_ver',
      '24 X 36 / Thin Canvas': 'canvas_600x900-mm-24x36-inch_canvas_wood-fsc-slim_4-0_ver',
      '28 X 40 / Thin Canvas': 'canvas_700x1000-mm-28x40-inch_canvas_wood-fsc-slim_4-0_ver',

      // if thick canvas is selected
      '12 X 18 / Thick Canvas': 'canvas_300x450-mm-12x18-inch_canvas_wood-fsc-thick_4-0_ver',
      '16 X 20 / Thick Canvas': 'canvas_400x500-mm-16x20-inch_canvas_wood-fsc-thick_4-0_ver',
      '18 X 24 / Thick Canvas': 'canvas_450x600-mm-18x24-inch_canvas_wood-fsc-thick_4-0_ver',
      '20 X 28 / Thick Canvas': 'canvas_500x700-mm-20x28-inch_canvas_wood-fsc-thick_4-0_ver',
      '24 X 36 / Thick Canvas': 'canvas_600x900-mm-24x36-inch_canvas_wood-fsc-thick_4-0_ver',
      '28 X 40 / Thick Canvas': 'canvas_700x1000-mm-28x40-inch_canvas_wood-fsc-thick_4-0_ver',
    };

    const posterArray: Array<{
      itemReferenceId: string;
      productUid: string;
      files: Array<{ type: string; url: string }>;
      quantity: number;
    }> = [];

    req.body.line_items?.forEach(
      (item: { id: number; variant_title: string; quantity: number }, index: number): void => {
        posterArray?.push({
          itemReferenceId: `${item?.id}`,
          productUid: posterUId[item?.variant_title],
          files: [
            {
              type: 'default',
              url: `${HOST}${cart?.totalPoster[index]?.posterImage}`,
            },
          ],
          quantity: item?.quantity,
        });
      },
    );

    const orderData = {
      orderType: 'order',
      orderReferenceId: `${req.body?.id}`,
      customerReferenceId: `${req.body?.customer?.id}`,
      currency: req.body?.customer?.currency,
      items: posterArray,
      shippingAddress: {
        companyName: req.body?.billing_address?.name,
        firstName: req.body?.billing_address?.first_name,
        lastName: req.body?.billing_address?.last_name,
        addressLine1: req.body?.billing_address?.address1,
        addressLine2: req.body?.billing_address?.address2,
        state: req.body?.billing_address?.province_code,
        city: req.body?.billing_address?.city,
        postCode: req.body?.billing_address?.zip,
        country: req.body?.billing_address?.country_code,
        email: req.body?.customer?.email,
        phone: req.body?.customer?.phone,
      },
    };
    const authOptions = {
      url: GELATO_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GELATO_API_KEY,
      },
      data: orderData,
      method: 'POST',
    };
    await axios(authOptions)
      .then((res) => {
        console.log('res ----> ', res);
      })
      .catch((error) => {
        console.log('error --->', error);
      });
    await Cart.findByIdAndUpdate(cart?._id, { totalPoster: [], totalPrice: 0 });
    return res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




