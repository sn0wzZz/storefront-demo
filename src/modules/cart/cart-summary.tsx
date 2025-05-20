'use client'

import { useState } from 'react'
import { useCart } from '@/providers/cart.provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CartSummary() {
  const { cart, checkout } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  // Example discount calculation (replace with your actual logic)
  const discount = appliedPromo ? 0.1 : 0 // 10% discount if promo applied

  // Calculate summary values
  const subtotal = cart?.total || 0
  const shipping = 0 // Free shipping in this example
  const estimatedTax = subtotal * 0.03 // Example tax calculation (3%)
  const discountAmount = subtotal * discount
  const total = subtotal + shipping + estimatedTax - discountAmount

  const handleApplyPromo = () => {
    // Example promo code validation
    if (promoCode.toUpperCase() === 'ONEDISCOUNT') {
      setAppliedPromo(promoCode)
      setPromoError(null)
    } else {
      setPromoError('Invalid promo code')
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
  }

  const handleCheckout = async () => {
    const result = await checkout()
    if (result.success) {
      // Redirect to success page or show success message
      console.log('Checkout successful', result.orderId)
    } else {
      // Handle checkout failure
      console.error('Checkout failed')
    }
  }

  return (
    <div className=' dark:bg-gray-800 rounded-lg p-6 space-y-6 border-l'>
      <div className='space-y-4'>
        <div className='flex justify-between text-sm'>
          <span>Total products</span>
          <span>{cart?.items.length || 0} Products</span>
        </div>

        <div className='flex justify-between'>
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>

        <div className='flex justify-between'>
          <span>Estimated shipping</span>
          <span>€{shipping.toFixed(2)}</span>
        </div>

        <div className='flex justify-between'>
          <span>Estimated tax</span>
          <span>€{estimatedTax.toFixed(2)}</span>
        </div>

        {appliedPromo && (
          <div className='flex justify-between text-green-600 dark:text-green-400'>
            <span>Discount (10% OFF)</span>
            <span>-€{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between font-bold'>
            <span>Total payment</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <p className='text-sm font-medium'>Do you have a promo code?</p>

        {appliedPromo ? (
          <div className='flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800'>
            <div className='flex items-center space-x-2'>
              <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-600 dark:text-green-400'>
                {appliedPromo.toUpperCase()} APPLIED
              </span>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleRemovePromo}
              className='h-6 w-6 text-green-600 dark:text-green-400 hover:text-red-500 dark:hover:text-red-400'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <div className='space-y-2'>
            <div
              className={cn(
                'flex p-2 border shadow-sm',
                promoError && 'border-red-500 focus-visible:ring-red-500'
              )}
            >
              <Input
                placeholder='Enter promo code'
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={'flex-1 border-0 shadow-none'}
              />
              <Button onClick={handleApplyPromo}>Apply</Button>
            </div>
            {promoError && <p className='text-xs text-red-500'>{promoError}</p>}
          </div>
        )}

        <p className='text-xs text-gray-500 dark:text-gray-400'>
          <Info className='inline-block h-4 w-4 mr-1' />
          To get a promo code you can help our social media, there we share
          promo codes every month.
        </p>
      </div>

      <Button
        className='w-full py-6 text-base font-medium'
        onClick={handleCheckout}
        disabled={!cart || cart.items.length === 0}
      >
        CHECKOUT
      </Button>

      <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
        By selecting a payment method, it&apos;s meant you agree to our Terms of Use,
        Sale, Return Policy, and Privacy Policy.
      </p>
    </div>
  )
}
