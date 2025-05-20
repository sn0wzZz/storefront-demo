'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useCookies } from 'react-cookie'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import {
  addProductsToCart,
  getOrCreateCart,
  removeProductsFromCart,
  updateCartItem,
} from '../actions/cart.actions'
import { CartItem as ApiCartItem } from '../types/cart'

const CART_ID_COOKIE = 'trigani_cart_id'

type CartItem = {
  id: string
  productId: string
  quantity: number
  price: number
  name: string
  image?: string
  attributes?: Record<string, string>
}

type Cart = {
  id: string
  items: CartItem[]
  status: 'active' | 'closed'
  createdAt: string
  updatedAt: string
  total: number
}

const configSchema = z.object({
  errorMessages: z
    .object({
      order: z.record(z.string(), z.function().returns(z.string())).optional(),
      cart: z
        .object({
          onCreate: z.function().returns(z.string()).optional(),
          onUpdate: z.function().returns(z.string()).optional(),
          onExpire: z.function().returns(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  staleTime: z.number().optional().default(60000),
  refetchInterval: z.number().optional().default(300000),
})

type CartConfig = z.infer<typeof configSchema>

const cartCache = new Map<string, Cart>()

const getCartById = async (cartId: string): Promise<Cart | null> => {
  if (!cartId) return null

  try {
    const response = await fetch(`/api/cart/get`)
    const data = await response.json()
    console.log('🛒 Raw cart data:', data)

    if (!data || !data.id) {
      console.error('Invalid cart data received:', data)
      return null
    }

    // Transform the API response into our Cart format
    const cart: Cart = {
      id: data.id,
      items:
        data.commerceCartItems?.map((item: ApiCartItem) => ({
          id: item.id || uuidv4(),
          productId: item.productId,
          quantity: item.qty,
          price:
            item.commerceProduct?.commerceProductsPrices?.find(
              (price) => price.type === 'retail'
            )?.value || 0,
          name:
            item.commerceProduct?.commerceProductsLocalizations?.[0]?.name ||
            '',
          image:
            item.commerceProduct?.relationshipsImageToCommerceProducts?.[0]
              ?.mediaFile?.url,
          attributes: {}, // Extract attributes if needed
        })) || [],
      status: data.status === 'open' ? 'active' : 'closed',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      total:
        data.commerceCartItems?.reduce(
          (sum: number, item: ApiCartItem) =>
            sum +
            (item.commerceProduct?.commerceProductsPrices?.find(
              (price) => price.type === 'retail'
            )?.value || 0) *
              item.qty,
          0
        ) || 0,
    }

    // Store in local cache
    cartCache.set(cartId, cart)

    console.log('Transformed cart:', cart)
    return cart
  } catch (error) {
    console.error('Error fetching cart:', error)
    return null
  }
}

const createCartInTrigani = async (): Promise<{
  success: boolean
  data?: Cart
}> => {
  try {
    console.log('Creating cart via server action...')
    const { cart: apiCart } = await getOrCreateCart()

    console.log('Cart created/retrieved:', apiCart)

    const cart: Cart = {
      id: apiCart.id,
      items:
        apiCart.items?.map((item: ApiCartItem) => ({
          id: item.id || uuidv4(),
          productId: item.productId,
          quantity: item.qty,
          price: item.price || 0,
          name: item.name || '',
          image: item.image,
          attributes: item.attributes,
        })) || [],
      status: apiCart.status === 'open' ? 'active' : 'closed',
      createdAt: apiCart.createdAt || new Date().toISOString(),
      updatedAt: apiCart.updatedAt || new Date().toISOString(),
      total: apiCart.total || 0,
    }

    // Store in local cache
    cartCache.set(cart.id, cart)

    console.log('This is the cart:', cart)

    return { success: true, data: cart }
  } catch (error) {
    console.error('Failed to create cart:', error)
    return { success: false }
  }
}

type CartContextType = {
  cart: Cart | null
  isLoading: boolean
  error: Error | null
  addItemToCart: (item: Omit<CartItem, 'id'>) => void
  removeItemFromCart: (itemId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  checkout: () => Promise<{ success: boolean; orderId?: string }>
  refetchCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

function CartProvider({
  children,
  config,
}: {
  children: React.ReactNode
  config?: CartConfig
}) {
  const validatedConfig = configSchema.parse(config || {})

  const [cookies, setCookie] = useCookies([CART_ID_COOKIE])
  const queryClient = useQueryClient()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeCart = async () => {
      try {
        if (!cookies[CART_ID_COOKIE]) {
          console.log('No cart ID in client cookies, creating cart...')
          const result = await createCartInTrigani()

          if (result.success && result.data) {
            console.log('Setting cart ID cookie on client:', result.data.id)
            setCookie(CART_ID_COOKIE, result.data.id, {
              path: '/',
              maxAge: 60 * 60 * 24 * 30, // 30 days
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production',
            })
          }
          console.log('🟢 Initialized:', isInitialized)
        } else {
          console.log(
            'Found cart ID in client cookies:',
            cookies[CART_ID_COOKIE]
          )
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing cart:', error)
        setIsInitialized(true)
      }
    }

    initializeCart()
  }, [])

  const cartId = useMemo(() => {
    return cookies[CART_ID_COOKIE] || null
  }, [cookies[CART_ID_COOKIE]])

  const queryKey = useMemo(() => ['trigani.commerce.cart', cartId], [cartId])

  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    staleTime: validatedConfig.staleTime,
    refetchInterval: validatedConfig.refetchInterval,
    queryFn: async () => {
      const cart = await getCartById(cartId)

      if (!cart || cart.status === 'closed') {
        const result = await createCartInTrigani()

        if (result.success && result.data) {
          return result.data
        }

        const newCart: Cart = {
          id: cartId,
          items: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          total: 0,
        }

        cartCache.set(cartId, newCart)
        return newCart
      }

      return cart
    },
  })

  const addItemToCart = useCallback(
    async (item: Omit<CartItem, 'id'>) => {
      if (!cart) return

      const oldCartState = { ...cart }
      const existingItemIndex = cart.items.findIndex(
        (i) => i.productId === item.productId
      )

      let updatedCart: Cart

      if (existingItemIndex >= 0) {
        const updatedItems = [...cart.items]
        const newQuantity =
          updatedItems[existingItemIndex].quantity + item.quantity

        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        }

        updatedCart = {
          ...cart,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
          total: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }

        // Update the UI optimistically
        queryClient.setQueryData(queryKey, updatedCart)

        // Update item quantity in API using server action
        try {
          await updateCartItem(item.productId, newQuantity)
        } catch (error) {
          console.error('Failed to update item quantity:', error)
          // Revert to old state if API call fails
          queryClient.setQueryData(queryKey, oldCartState)
          return
        }
      } else {
        const newItem = {
          id: uuidv4(),
          ...item,
        }

        updatedCart = {
          ...cart,
          items: [...cart.items, newItem],
          updatedAt: new Date().toISOString(),
          total:
            cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ) +
            item.price * item.quantity,
        }

        // Update the UI optimistically
        queryClient.setQueryData(queryKey, updatedCart)

        // Add new item to API using server action
        try {
          await addProductsToCart([
            {
              productId: item.productId,
              qty: item.quantity,
            },
          ])
        } catch (error) {
          console.error('Failed to add item to cart:', error)
          // Revert to old state if API call fails
          queryClient.setQueryData(queryKey, oldCartState)
          return
        }
      }

      // Update local cache
      cartCache.set(cart.id, updatedCart)
    },
    [cart, queryClient, queryKey]
  )

  const removeItemFromCart = useCallback(
    async (itemId: string) => {
      if (!cart) return

      const oldCartState = { ...cart }
      const itemToRemove = cart.items.find((item) => item.id === itemId)

      if (!itemToRemove) return

      const updatedItems = cart.items.filter((item) => item.id !== itemId)

      const updatedCart = {
        ...cart,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
        total: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      }

      // Update the UI optimistically
      queryClient.setQueryData(queryKey, updatedCart)

      // Remove item from API using server action
      try {
        await removeProductsFromCart([itemToRemove.productId])
      } catch (error) {
        console.error('Failed to remove item from cart:', error)
        // Revert to old state if API call fails
        queryClient.setQueryData(queryKey, oldCartState)
        return
      }

      // Update local cache
      cartCache.set(cart.id, updatedCart)
    },
    [cart, queryClient, queryKey]
  )

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart) return

      const oldCartState = { ...cart }
      const itemIndex = cart.items.findIndex((item) => item.id === itemId)

      if (itemIndex === -1) return

      const productId = cart.items[itemIndex].productId

      let updatedCart: Cart

      if (quantity <= 0) {
        // Remove the item
        const updatedItems = cart.items.filter((item) => item.id !== itemId)

        updatedCart = {
          ...cart,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
          total: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }

        // Update the UI optimistically
        queryClient.setQueryData(queryKey, updatedCart)

        // Remove from API using server action
        try {
          await removeProductsFromCart([productId])
        } catch (error) {
          console.error('Failed to remove item from cart:', error)
          // Revert to old state if API call fails
          queryClient.setQueryData(queryKey, oldCartState)
          return
        }
      } else {
        // Update the quantity
        const updatedItems = [...cart.items]
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity,
        }

        updatedCart = {
          ...cart,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
          total: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }

        // Update the UI optimistically
        queryClient.setQueryData(queryKey, updatedCart)

        // Update in API using server action
        try {
          await updateCartItem(productId, quantity)
        } catch (error) {
          console.error('Failed to update item quantity:', error)
          // Revert to old state if API call fails
          queryClient.setQueryData(queryKey, oldCartState)
          return
        }
      }

      // Update local cache
      cartCache.set(cart.id, updatedCart)
    },
    [cart, queryClient, queryKey]
  )

  const clearCart = useCallback(async () => {
    if (!cart || cart.items.length === 0) return

    const oldCartState = { ...cart }

    const productIds = cart.items.map((item) => item.productId)

    const updatedCart = {
      ...cart,
      items: [],
      updatedAt: new Date().toISOString(),
      total: 0,
    }

    // Update the UI optimistically
    queryClient.setQueryData(queryKey, updatedCart)

    // Remove all items from API using server action
    try {
      await removeProductsFromCart(productIds)
    } catch (error) {
      console.error('Failed to clear cart:', error)
      // Revert to old state if API call fails
      queryClient.setQueryData(queryKey, oldCartState)
      return
    }

    // Update local cache
    cartCache.set(cart.id, updatedCart)
  }, [cart, queryClient, queryKey])

  const checkout = useCallback(async () => {
    if (!cart || cart.items.length === 0) {
      return { success: false }
    }

    //TODO: implement checkout logic
    await clearCart()
    return { success: true, orderId: uuidv4() }
  }, [cart, clearCart])

  return (
    <CartContext.Provider
      value={{
        cart: cart || null,
        isLoading,
        error,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        checkout,
        refetchCart: refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

function useCart() {
  const context = useContext(CartContext)
  if (context === undefined || context === null)
    throw new Error('useCart was used outside of CartProvider')
  return context
}

export { CartProvider, useCart }
