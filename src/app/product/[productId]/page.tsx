import { getProductById, getProductGroupItems } from '@/lib/commerce-api'
import ProductView from '@/modules/product-view'
import { ProductVariantDisplay } from '@/types/product'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getProductById(productId)

  if (!product) {
    return <div>Product not found</div>
  }

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

  // Get variants from group items if the product is part of a group
  let variants: ProductVariantDisplay[] = []

  // Inside the ProductPage component, in the part where we fetch variants:

  if (
    product.commerceProductToGroups &&
    product.commerceProductToGroups.length > 0
  ) {
    const groupId = product.commerceProductToGroups[0].groupId

    if (groupId) {
      try {
        // Fetch all products in this group
        const groupItems = await getProductGroupItems(groupId)

        // For each group item, fetch the variant product
        if (groupItems && groupItems.length > 0) {
          // Make sure we have a valid array to map over
          const productToGroups = groupItems[0]?.commerceProductToGroups || []

          const variantPromises = productToGroups
            .filter((item) => item.productId && item.productId !== productId && !item.isMain)
            .map(async (item) => {
              try {
                const variantProduct = await getProductById(item.productId)

                if (!variantProduct) return null

                // Get variant attributes
                const variantSizeAttr =
                  variantProduct.commerceProductsAttributesValues?.find(
                    (attr) =>
                      attr.commerceProductsAttributesField?.name === 'Size' ||
                      attr.fieldId === 'a3a08a37-dae4-482a-9267-e9e67e462fa4'
                  )

                const variantColorAttr =
                  variantProduct.commerceProductsAttributesValues?.find(
                    (attr) =>
                      attr.commerceProductsAttributesField?.name === 'Color' ||
                      attr.fieldId === '7d892380-ff94-4ef6-898a-9b4b63499f99'
                  )

                // Get variant images
                const variantImages =
                  variantProduct.relationshipsImageToCommerceProducts?.map(
                    (rel) => rel.mediaFile
                  ) || []

                // Get variant price
                const variantPrice =
                  variantProduct.commerceProductsPrices?.find(
                    (price) => price.type === 'retail'
                  )

                // Get variant inventory
                const variantInventory =
                  variantProduct.commerceProductsInventories?.[0]?.value || 0

                return {
                  id: variantProduct.id,
                  size: variantSizeAttr?.value || '',
                  color: variantColorAttr?.value || '',
                  images: variantImages,
                  price: variantPrice?.value || 0,
                  inventory: variantInventory,
                  name:
                    variantProduct.commerceProductsLocalizations?.[0]?.name ||
                    '',
                }
              } catch (error) {
                console.error(
                  `Error fetching variant product ${item.productId}:`,
                  error
                )
                return null
              }
            })

          // Now we're sure variantPromises is a valid array
          if (variantPromises.length > 0) {
            const variantResults = await Promise.all(variantPromises)
            variants = variantResults.filter(Boolean) as ProductVariantDisplay[]
          }
        }
      } catch (error) {
        console.error(`Error fetching group items for group ${groupId}:`, error)
      }
    }
  }

  console.log('variants', variants)

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
    categories: product?.commerceProductToCategories || [],
    isConfigurable: !!variants?.length,
    variants: variants,
  }

  return (
    <div className='max-w-[2560px] py-8 mx-auto'>
      <ProductView
        id={productId}
        images={images}
        productName={productInfo?.name || 'Product'}
        productDetails={productDetails}
        variants={variants}
      />
    </div>
  )
}
