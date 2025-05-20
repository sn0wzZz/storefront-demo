'use server'
import { cookies } from 'next/headers'

const CART_ID_COOKIE = 'trigani_cart_id'
const COOKIE_EXPIRY_DAYS = 30

export async function getCartIdFromCookie(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(CART_ID_COOKIE)?.value
  } catch (error) {
    console.error('Error getting cart ID from cookie:', error)
    return undefined
  }
}

export async function setCartIdCookie(cartId: string): Promise<void> {
  try {
    const cookieStore = await cookies()

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS)

    cookieStore.set(CART_ID_COOKIE, cartId, {
      expires: expiryDate,
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  } catch (error) {
    console.error('Error setting cart ID cookie:', error)
  }
}

export async function removeCartIdCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(CART_ID_COOKIE)
    console.log('Removed cookie')
  } catch (error) {
    console.error('Error removing cart ID cookie:', error)
  }
}
