import { Button } from '@/components/ui/button'
import CartTable from '@/modules/cart/cart-table'
import { Trash } from 'lucide-react'

export default function page() {
  return (
    <>
      {/* Cart */}
      <div className='flex items-center justify-between p-4 border-y h-16'>
        <span className='body-20-medium'>YOUR CART</span>
        <Button variant={'ghost'}>
          <Trash className='h-4 w-4 mr-2' />
          DELETE ALL
        </Button>
      </div>
      <CartTable />
    </>
  )
}
