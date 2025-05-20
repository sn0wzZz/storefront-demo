'use client'
import { Product } from '@/types/product'
import { ProductCard } from './product-card'

interface ProductListProps {
  initialProducts?: Product[]
}

export default function ProductList({
  initialProducts = [],
}: ProductListProps) {
  // Since data is now fetched in the parent component with Suspense,
  // we can simplify this component to just render the products

  const formatProductForCard = (product: Product) => {
    // Get the first translation (preferably in the current language)
    const translation = product.commerceProductsLocalizations?.[0]

    // Get the first price
    const price = product.commerceProductsPrices?.find(
      (price) => price.type === 'retail' )

    // Get all images
    const images = product.relationshipsImageToCommerceProducts
      .sort((a, b) => a.index - b.index) // Sort by index
      .map((img) => img.mediaFile.url)

    return {
      id: product.id,
      name: translation?.name || `Product ${product.folio}`,
      price: price?.value || 0,
      discount: price?.discount,
      images: images.length > 0 ? images : ['/home/item.png'],
    }
  }

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
