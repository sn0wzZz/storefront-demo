'use client'
import { Product } from '@/types/product'
import { ProductCard } from './product-card'

interface ProductListProps {
  initialProducts?: Product[]
}

export default function ProductList({
  initialProducts = [],
}: ProductListProps) {
  const formatProductForCard = (product: Product) => {
    // Get the first translation
    const translation = product.commerceProductsLocalizations?.[0]

    // Get the retail price
    const price = product.commerceProductsPrices?.find(
      (price) => price.type === 'retail'
    )

    // Get all images sorted by index
    const images = product.relationshipsImageToCommerceProducts
      .sort((a, b) => a.index - b.index)
      .map((img) => img.mediaFile.url)

    // Check if this is a configurable product with variants
    const isConfigurable = product.type === 'configurable'

    // Determine the target product ID (for configurable products, we'll handle this in the card)
    const targetProductId = product.id

    return {
      id: product.id,
      name: translation?.name || `Product ${product.folio}`,
      price: price?.value || 0,
      discount: price?.discount,
      images: images.length > 0 ? images : ['/home/item.png'],
      isConfigurable,
      targetProductId,
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
