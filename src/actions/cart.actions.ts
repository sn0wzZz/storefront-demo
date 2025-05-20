'use server'

import {
  Cart,
  CustomerInfo,
  ProductToAdd,
} from '../types/cart'
import {
  createCart as apiCreateCart,
  updateCart as apiUpdateCart,
  addProductsToCart as apiAddProductsToCart,
  removeProductsFromCart as apiRemoveProductsFromCart,
  updateCartItem as apiUpdateCartItem,
  createOrder as apiCreateOrder,
} from '../lib/cart-api'
import { getCartIdFromCookie, setCartIdCookie } from '../lib/cookie-utils'

/**
 * Creates a new cart or retrieves existing cart from cookie
 */
export async function getOrCreateCart(): Promise<{
  cartId: string
  cart: Cart
}> {
  try {
    // Check if cart ID exists in cookie
    const existingCartId = await getCartIdFromCookie()

    if (existingCartId) {
      console.log('Using existing cart ID from cookie:', existingCartId)
      return {
        cartId: existingCartId,
        cart: { id: existingCartId, status: 'open' } as Cart,
      }
    }

    // Create new cart
    console.log('No cart ID found in cookie, creating new cart...')
    const response = await apiCreateCart()

    console.log(response)

    if (!response.data) {
      throw new Error('Failed to create cart: No data returned from API')
    }

    // Extract cart ID from response
    const cartId = response.data.id
    console.log('New cart created with ID:', cartId)

    // Save cart ID to cookie
    await setCartIdCookie(cartId)
    console.log('Cart ID saved to cookie')

    return { cartId, cart: response.data }
  } catch (error) {
    console.error('Error in getOrCreateCart:', error)
    throw error
  }
}

/**
 * Updates cart customer information
 */
export async function updateCart(customerInfo: CustomerInfo): Promise<Cart> {
  try {
    const { cartId } = await getOrCreateCart()
    console.log('Updating cart with customer info:', cartId, customerInfo)
    return await apiUpdateCart(cartId, customerInfo)
  } catch (error) {
    console.error('Error in updateCart:', error)
    throw error
  }
}

/**
 * Adds products to a cart
 */
export async function addProductsToCart(
  products: ProductToAdd[]
): Promise<Cart> {
  try {
    // Get cart ID from cookie or create new cart
    const { cartId } = await getOrCreateCart()
    console.log('Adding products to cart:', cartId, products)
    return await apiAddProductsToCart(cartId, products)
  } catch (error) {
    console.error('Error in addProductsToCart:', error)
    throw error
  }
}

/**
 * Removes products from a cart
 */
export async function removeProductsFromCart(
  productIds: string[]
): Promise<Cart> {
  try {
    const cartId = await getCartIdFromCookie()

    if (!cartId) {
      throw new Error('No cart found')
    }

    console.log('Removing products from cart:', cartId, productIds)
    return await apiRemoveProductsFromCart(cartId, productIds)
  } catch (error) {
    console.error('Error in removeProductsFromCart:', error)
    throw error
  }
}

/**
 * Updates the quantity of a product in the cart
 */
export async function updateCartItem(
  productId: string,
  qty: number
): Promise<Cart> {
  try {
    const cartId = await getCartIdFromCookie()

    if (!cartId) {
      throw new Error('No cart found')
    }

    console.log('Updating cart item:', cartId, productId, qty)
    return await apiUpdateCartItem(cartId, productId, qty)
  } catch (error) {
    console.error('Error in updateCartItem:', error)
    throw error
  }
}

/**
 * Creates an order from a cart
 * @param orderData The order data including customer and shipping information
 * @returns The created order
 */
export async function createOrder(orderData: unknown): Promise<unknown> {
  try {
    const cartId = await getCartIdFromCookie()

    if (!cartId) {
      throw new Error('No cart found')
    }

    console.log(orderData)
    console.log('Creating order from cart:', cartId)
    const result = await apiCreateOrder(cartId, orderData)
    
    // After successful order creation, you might want to clear the cart cookie
    // This depends on your application's requirements
    // await clearCartCookie()
    
    return result
  } catch (error) {
    console.error('Error in createOrder:', error)
    throw error
  }
}
