'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, Menu } from 'lucide-react'
import { useCart } from '@/providers/cart.provider'
import { CurrencySelector } from './currency-selector'
import { CoreCurrency } from '@/types/store'

export default function HeaderActions({
  currencies,
}: {
  currencies: CoreCurrency[] | undefined
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cart } = useCart()

  return (
    <div className='flex items-center space-x-4'>
      <Suspense fallback={<div>Loading...</div>}>
        <CurrencySelector currencies={currencies} />
      </Suspense>
      <button
        className='p-2 hover:bg-gray-100 rounded-full'
        aria-label='Search'
      >
        <Search className='h-5 w-5' />
      </button>

      <Link
        href='/cart'
        className='p-2 hover:bg-gray-100 rounded-full relative'
        aria-label='Shopping cart'
      >
        <ShoppingBag className='h-5 w-5' />
        <span className='absolute top-0 right-0 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center'>
          {cart?.items.length || 0}
        </span>
      </Link>

      <button
        className='p-2 hover:bg-gray-100 rounded-full md:hidden'
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label='Toggle mobile menu'
      >
        <Menu className='h-5 w-5' />
      </button>

      {/* Mobile menu could be implemented here */}
    </div>
  )
}
