import { Product } from '@/types/product'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'
import { ProductCard } from '@/modules/home/product-card'
import { formatProductForCard } from '@/lib/helpers/format-product-card'

export default function ProductsCarousel({
  products,
  children,
}: {
  products: Product[]
  children?: React.ReactNode
}) {
  return (
    <Carousel
      opts={{
        align: 'start',
      }}
      className='w-full '
    >
      <div className='flex my-8 justify-between gap-8 mx-6'>
        {children}

        <div className='relative flex  gap-4'>
          <CarouselPrevious className='relative' />
          <CarouselNext className='relative' />
        </div>
      </div>
      <CarouselContent >
        {products.map((product, index) => (
          <CarouselItem key={index} className='md:basis-1/2 lg:basis-2/8 '>
            <ProductCard product={formatProductForCard(product)} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
