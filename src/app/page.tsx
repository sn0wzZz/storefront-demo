import { getProductGroupItems, getProducts } from '@/lib/commerce-api'
import ProductGridSkeleton from '@/modules/home/product-grid-skeleton'
import ProductList from '@/modules/home/product-list'
import { Suspense } from 'react'

async function SuspendedProductList() {
  const products = await getProducts()

  // For each product that has a group, fetch the group items
  const productsWithGroups = await Promise.all(
    products.map(async (product) => {
      // Check if product has a group
      if (
        product.commerceProductToGroups &&
        product.commerceProductToGroups.length > 0
      ) {
        // Find the group where this product is the main product
        const mainGroup = product.commerceProductToGroups.find(
          (group) => group.isMain === true
        )

        if (mainGroup) {
          // Fetch all products in this group
          const groupItems = await getProductGroupItems(mainGroup.groupId)
          return {
            ...product,
            groupItems,
          }
        }
      }

      return product
    })
  )

  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductList initialProducts={productsWithGroups} />
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
