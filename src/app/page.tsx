import { getProducts } from '@/lib/api'
import ProductGridSkeleton from '@/modules/home/product-grid-skeleton'
import ProductList from '@/modules/home/product-list'
import { Suspense } from 'react'

async function SuspendedProductList() {
  const products = await getProducts()
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductList initialProducts={products} />
    </Suspense>
  )
}

export default function Home() {
  return (
    <div className='container py-20 mx-auto'>
      <SuspendedProductList />
    </div>
  )
}
