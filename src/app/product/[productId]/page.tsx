import { getProductById } from '@/lib/api'
import ProductImages from '@/modules/product-view/product-images'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getProductById(productId)
  console.log('product', product?.commerceProductToCategories)

  // Get the first localization (assuming it's the default language)
  const productInfo = product?.commerceProductsLocalizations?.[0]

  // Get product images
  const images =
    product?.relationshipsImageToCommerceProducts?.map(
      (rel) => rel.mediaFile
    ) || []

  // Get product price (retail price in the first currency)
  const retailPrice = product?.commerceProductsPrices?.find(
    (price) => price.type === 'retail'
  )
  const price = retailPrice ? retailPrice.value : 0
  const currency = retailPrice?.coreCurrency?.symbol || '€'

  // Get product attributes (like size)
  const sizeAttribute = product?.commerceProductsAttributesValues?.find(
    (attr) =>
      attr.commerceProductsAttributesField?.name === 'Size' ||
      attr.fieldId === 'a3a08a37-dae4-482a-9267-e9e67e462fa4'
  )
  const size = sizeAttribute?.value || ''

  // Get color attribute
  const colorAttribute = product?.commerceProductsAttributesValues?.find(
    (attr) =>
      attr.commerceProductsAttributesField?.name === 'Color' ||
      attr.fieldId === '7d892380-ff94-4ef6-898a-9b4b63499f99'
  )
  const color = colorAttribute?.value || ''

  // Get inventory
  const inventory = product?.commerceProductsInventories?.[0]?.value || 0

  // Available sizes
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  // Available colors
  const availableColors = [
    { name: 'White', value: 'бял', hex: '#FFFFFF', border: true },
    { name: 'Black', value: 'черен', hex: '#000000' },
    { name: 'Blue', value: 'син', hex: '#3B82F6' },
    { name: 'Red', value: 'червен', hex: '#EF4444' },
  ]

  // Prepare product details to pass to ProductImages
  const productDetails = {
    name: productInfo?.name || 'Product',
    description: productInfo?.description || 'No description available',
    price,
    currency,
    size,
    color,
    inventory,
    availableSizes,
    availableColors,
    categories: product?.commerceProductToCategories || [],
  }

  return (
    <div className='max-w-[2560px] py-8 mx-auto'>
      <ProductImages
        images={images}
        productName={productInfo?.name || 'Product'}
        productDetails={productDetails}
      />
    </div>
  )
}
