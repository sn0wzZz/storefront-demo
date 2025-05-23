import { Product } from '@/types/product'

export const formatProductForCard = (product: Product) => {
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
