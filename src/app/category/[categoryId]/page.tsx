import { Suspense } from 'react'
import { getCategoryById, getProductsByCategory } from '@/lib/api'
import ProductGridSkeleton from '@/modules/home/product-grid-skeleton'
import ProductList from '@/modules/home/product-list'

interface CategoryPageProps {
  params: Promise<{
    categoryId: string
  }>
}

async function CategoryProductList({ categoryId }: { categoryId: string }) {
  const response = await getProductsByCategory(categoryId)

  // Check if response has the expected structure
  const products = response?.data || []

  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductList initialProducts={products} />
    </Suspense>
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params

  // Get category details
  const category = await getCategoryById(categoryId)

  // If category doesn't exist, we could handle this better
  if (!category || !category.data) {
    return (
      <div className='container mx-auto py-20 text-center'>
        <h1 className='text-3xl font-bold mb-6'>Category not found</h1>
        <p>
          The category you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    )
  }

  const categoryData = category?.data.commerceCategoriesLocalizations?.[0]

  return (
    <div className='container mx-auto py-12'>
      <div className='mb-10'>
        <h1 className='text-4xl font-bold mb-4 capitalize'>
          {categoryData.name}
        </h1>
        {categoryData.description && (
          <p className='text-gray-600 max-w-3xl'>{categoryData.description}</p>
        )}
      </div>

      <CategoryProductList categoryId={categoryId} />
    </div>
  )
}
