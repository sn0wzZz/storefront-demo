'use client'

import { useState } from 'react'
import { useCart } from '@/providers/cart.provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCheckout } from '@/providers/checkout.provider'

export default function CartSummary() {
  const { cart } = useCart()
  const { activeTab, nextTab, onSubmit, isSubmitting, form } = useCheckout()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const pathname = usePathname()

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

  const handleSubmit = () => {
    const formValues = form.getValues()
    onSubmit(formValues)
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b h-16'>
        <span className='body-20-medium'>SUMMARY</span>
      </div>

      {/* Content */}
      <div className='flex flex-col p-6 overflow-hidden h-[calc(100%-4rem)]'>
        {/* Summary details - always visible */}
        <div className='flex-shrink-0 space-y-4 mb-6'>
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

        {pathname === '/cart' && (
          <div className='flex flex-col h-full'>
            {/* Promo code section */}
            <div className='flex-grow space-y-4 mb-6'>
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
                      className='flex-1 border-0 shadow-none bg-transparent'
                    />
                    <Button onClick={handleApplyPromo}>Apply</Button>
                  </div>
                  {promoError && (
                    <p className='text-xs text-red-500'>{promoError}</p>
                  )}
                </div>
              )}

              <p className='text-xs text-gray-500 dark:text-gray-400'>
                <Info className='inline-block h-4 w-4 mr-1' />
                To get a promo code you can help our social media, there we
                share promo codes every month.
              </p>
            </div>

            {/* Button - fixed at bottom */}
            <div className='flex-shrink-0'>
              <Link href='/cart/checkout'>
                <Button
                  className='w-full py-6 text-base font-medium'
                  disabled={!cart || cart.items.length === 0}
                >
                  CHECKOUT
                </Button>
              </Link>

              <p className='text-xs text-gray-500 dark:text-gray-400 text-center mt-4'>
                By selecting a payment method, it&apos;s meant you agree to our
                Terms of Use, Sale, Return Policy, and Privacy Policy.
              </p>
            </div>
          </div>
        )}

        {pathname === '/cart/checkout' && (
          <div className='flex flex-col h-full'>
            {/* Scrollable product list */}
            <div className='flex-grow overflow-y-auto mb-6 h-[270px]'>
              {cart?.items.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between mb-4'
                >
                  <div className='flex items-start space-x-2'>
                    <div className='relative h-[111px] w-[111px]'>
                      <Image
                        src={item.image ?? '/home/item.png'}
                        alt={item.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div>
                      <p className='body-18-medium'>{item.name}</p>
                      <p className='body-20-semibold'>
                        €{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Button - fixed at bottom */}
            <div className='flex-shrink-0 py-6 '>
              {activeTab !== 'payment' ? (
                <Button
                  className='w-full  text-base font-medium'
                  disabled={!cart || cart.items.length === 0}
                  onClick={() => nextTab()}
                >
                  CONTINUE
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className='w-full text-base font-medium'
                  disabled={!cart || cart.items.length === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}