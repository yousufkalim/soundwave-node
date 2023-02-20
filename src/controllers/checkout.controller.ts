/**
 * Checkout controllers
 * @author Yousuf Kalim
 */
import { Request, Response } from 'express';
import { IProduct, IProductVariant } from 'shopify-api-node';
import Cart from '@models/cart.model';
import axios, { AxiosResponse } from 'axios';

// Load environment variables
import {
  SHOPIFY_SHOP,
  SHOPIFY_ADMIN_ACCESS_TOKEN_TOKEN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
} from '@config';

/**
 * Create checkout
 * @param {object} req
 * @param {object} res
 */
export const createCheckout = async (req: Request, res: Response): Promise<Response> => {
  // Modifying shopify types
  interface ProductVariant extends IProductVariant {
    admin_graphql_api_id: string;
  }
  interface Product extends IProduct {
    variants: ProductVariant[];
  }

  try {
    const { cartId } = req.params;
    const cart = await Cart.findById(cartId);

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Create an array of product promises by mapping over each item in the cart
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const productPromises = cart?.totalPoster.map((item) => {
      // Send a POST request to create a new product in Shopify's admin API
      return axios({
        method: 'post',
        url: `https://${SHOPIFY_SHOP}/admin/api/2021-10/products.json`,
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
    // @ts-expect-error
    const products = (await Promise.all(productPromises)) as Array<
      AxiosResponse<{ product: Product }>
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

    // Done dana done
    return res.json({ success: true, checkoutURL: checkout.webUrl });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
