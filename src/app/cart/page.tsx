import { Button } from '@/components/ui/button'
import CartSummary from '@/modules/cart/cart-summary'
import CartTable from '@/modules/cart/cart-table'
import { Trash } from 'lucide-react'

export default function page() {
  return (
    <div className=' py-10 '>
      {/* Cart & Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 border-b'>
        {/* Cart */}
        <div className='col-span-full md:col-span-2'>
          <div className='flex items-center justify-between p-4 border-y h-16'>
            <span className='body-20-medium'>YOUR CART</span>
            <Button variant={'ghost'}>
              <Trash className='h-4 w-4 mr-2' />
              DELETE ALL
            </Button>
          </div>
          <CartTable />
        </div>
        {/* Summary */}
        <div className='col-span-full md:col-span-1'>
          <div className='flex items-center justify-between p-4 border-y border-l h-16'>
            <span className='body-20-medium'>SUMMARY</span>
          </div>
          <CartSummary />
        </div>
      </div>
      {/* Recommended */}
    </div>
  )
}
