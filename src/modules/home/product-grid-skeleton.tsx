import { Skeleton } from '@/components/ui/skeleton'

export default function ProductGridSkeleton() {
  // Create an array of 8 items to represent loading products
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div>
      <Skeleton className='h-8 w-48 mb-6' /> {/* Skeleton for title */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {skeletonItems.map((item) => (
          <div
            key={item}
            className='overflow-hidden h-full flex flex-col relative'
          >
            <Skeleton className='h-[300px] w-full rounded-t-md' />{' '}
            {/* Product image */}
            <div className='p-4 space-y-2'>
              <Skeleton className='h-5 w-3/4' /> {/* Product name */}
              <Skeleton className='h-6 w-1/3' /> {/* Product price */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
