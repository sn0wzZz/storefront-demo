import axios from 'axios'
import {
  Cart,
  CartApiResponse,
  CustomerInfo,
  ProductToAdd,
} from '../types/cart'

// Base API URL for workspace-level operations
const BASE_URL = `${
  process.env.NEXT_PUBLIC_API_DOMAIN || 'https://app.trigani.dev'
}/api/v1/${process.env.NEXT_PUBLIC_API_WORKSPACE}/commerce/carts`

// Base API URL for store-level operations
const BASE_URL_STORE = `${
  process.env.NEXT_PUBLIC_API_DOMAIN || 'https://app.trigani.dev'
}/api/v1/${process.env.NEXT_PUBLIC_API_WORKSPACE}/commerce/stores/${
  process.env.NEXT_PUBLIC_API_SPACE
}/carts`

// Create axios instance with common headers
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: process.env.API_KEY!,
  },
})

/**
 * Creates a new cart
 * @returns The created cart
 */
export async function createCart(): Promise<CartApiResponse> {
  try {
    const response = await api.post<CartApiResponse>(BASE_URL, {
      workspaceId: process.env.NEXT_PUBLIC_API_WORKSPACE,
      storeId: process.env.NEXT_PUBLIC_API_SPACE,
      currencyId: '88367305-a895-4fa5-8cb0-93020a5ffc9e',
      status: 'open',
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Create cart error details:', error.response?.data)
      throw new Error(`Failed to create cart: ${error.message}`)
    }
    throw error
  }
}

/**
 * Retrieves a cart by its ID
 * @param cartId The ID of the cart to retrieve
 * @returns The cart data
 */
export async function getCart(cartId: string): Promise<Cart> {
  try {
    const response = await api.get<CartApiResponse>(
      `${BASE_URL_STORE}/${cartId}`
    )
    console.log('🛒 Retrieved cart:', cartId)

    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Get cart error details:', error.response?.data)
      throw new Error(`Failed to retrieve cart: ${error.message}`)
    }
    throw error
  }
}

/**
 * Updates cart customer information
 * @param cartId The ID of the cart to update
 * @param customerInfo Customer information to update
 * @returns The updated cart
 */
export async function updateCart(
  cartId: string,
  customerInfo: CustomerInfo
): Promise<Cart> {
  try {
    const response = await api.patch<Cart>(`${BASE_URL}/${cartId}`, {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      contactId: customerInfo.contactId,
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Update cart error details:', error.response?.data)
      throw new Error(`Failed to update cart: ${error.message}`)
    }
    throw error
  }
}

/**
 * Adds products to a cart
 * @param cartId The ID of the cart
 * @param products Array of products to add
 * @returns The updated cart with items
 */
export async function addProductsToCart(
  cartId: string,
  products: ProductToAdd[]
): Promise<Cart> {
  const data = products.map((product) => ({
    cartId,
    productId: product.productId,
    storeId: process.env.NEXT_PUBLIC_API_SPACE,
    qty: product.qty,
  }))

  try {
    const response = await api.post<Cart>(`${BASE_URL}/${cartId}`, {
      data: data,
    })

    console.log('➕ Added item to cart:', products)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Add products error details:', error.response?.data)
      throw new Error(`Failed to add products to cart: ${error.message}`)
    }
    throw error
  }
}

/**
 * Removes products from a cart
 * @param cartId The ID of the cart
 * @param productIds Array of product IDs to remove
 * @returns The updated cart
 */
export async function removeProductsFromCart(
  cartId: string,
  productIds: (string | undefined)[]
): Promise<Cart> {
  try {
    const response = await api.delete<Cart>(`${BASE_URL}/${cartId}/items`, {
      data: {
        cartId,
        productIds,
      },
    })

    console.log('➖ Removed item from cart:', productIds)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Remove products error details:', error.response?.data)
      throw new Error(`Failed to remove products from cart: ${error.message}`)
    }
    throw error
  }
}

/**
 * Updates the quantity of a product in the cart
 * @param cartId The ID of the cart
 * @param productId The ID of the product to update
 * @param qty The new quantity
 * @returns The updated cart item
 */
export async function updateCartItem(
  cartId: string,
  productId: string,
  qty: number
): Promise<Cart> {
  try {
    // Using the correct endpoint and data format
    const response = await api.patch<Cart>(
      `${BASE_URL}/${cartId}/items/${productId}`,
      {
        cartId,
        productId,
        qty,
      }
    )

    console.log('🔄 Updated cart item:', productId, 'quantity:', qty)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Update cart item error details:', error.response?.data)
      throw new Error(`Failed to update cart item: ${error.message}`)
    }
    throw error
  }
}

/**
 * Creates an order from a cart
 * @param cartId The ID of the cart
 * @param orderData The order data
 * @returns The created order
 */
export async function createOrder(
  cartId: string,
  orderData: unknown
): Promise<unknown> {
  try {
    const response = await api.post(
      `${BASE_URL_STORE}/${cartId}/order`,
      orderData
    )

    console.log('📦 Created order from cart:', cartId)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Create order error details:', error.response?.data)
      throw new Error(`Failed to create order: ${error.message}`)
    }
    throw error
  }
}
