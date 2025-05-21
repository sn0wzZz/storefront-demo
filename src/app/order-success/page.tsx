'use client'

import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
  return (
    <div className='container max-w-4xl mx-auto h-screen flex-center px-4'>
      <div className='text-center mb-10'>
        <CheckCircle className='w-20 h-20 text-green-500 mx-auto mb-6' />
        <h1 className='text-3xl font-bold mb-4'>Thank You for Your Order!</h1>
        <p className='text-gray-600 dark:text-gray-400 mb-8'>
          Your order has been received and is now being processed.
        </p>

        <Link href='/'>
          <Button className='flex items-center w-full'>
            <ArrowLeft className='mr-2 w-4 h-4' />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
