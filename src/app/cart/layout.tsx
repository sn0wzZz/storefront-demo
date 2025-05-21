'use client'

import CartSummary from '@/modules/cart/cart-summary'

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='pt-16'>
      <div className='flex flex-col lg:flex-row'>
        {/* Main Content - Fluid width, takes remaining space */}
        <div className='flex-grow lg:max-w-[calc(100%-447px)]'>{children}</div>

        {/* Summary - Fixed width, always visible */}
        <div className='w-full lg:w-[447px] lg:fixed lg:right-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:border-l lg:overflow-hidden'>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
