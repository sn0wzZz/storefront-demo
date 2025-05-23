'use client'
import { Product } from '@/types/product'
import { ProductCard } from './product-card'
import { formatProductForCard } from '@/lib/helpers/format-product-card'

interface ProductListProps {
  initialProducts?: Product[]
}

export default function ProductList({
  initialProducts = [],
}: ProductListProps) {


  if (initialProducts.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <p>No products found.</p>
      </div>
    )
  }

  return (
    <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
      {initialProducts.map((product) => (
        <li key={product.id}>
          <ProductCard product={formatProductForCard(product)} />
        </li>
      ))}
    </ul>
  )
}
