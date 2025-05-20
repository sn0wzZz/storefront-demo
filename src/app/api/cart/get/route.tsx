import { getCart } from '@/lib/cart-api'
import { getCartIdFromCookie } from '@/lib/cookie-utils'
import { NextResponse } from 'next/server'

export async function GET(
) {
  try {
    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 })
    }

    const cart = await getCart(cartId)
    return NextResponse.json(cart)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
