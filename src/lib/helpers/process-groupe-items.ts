import { Product } from '@/types/product'
import { getProductGroupItems } from '../commerce-api'

export async function processProductsWithGroups(
  products: Product[]
): Promise<Product[]> {
  // Filter out products that are part of a group but are not main products
  const filteredProducts = products.filter((product) => {
    // If the product is not part of a group, include it
    if (
      !product.commerceProductToGroups ||
      product.commerceProductToGroups.length === 0
    ) {
      return true
    }

    // If the product is part of a group, check if it's the main product
    return product.commerceProductToGroups.some(
      (group) => group.isMain === true
    )
  })

  // For each main product that is part of a group, fetch its variants
  const productsWithVariants = await Promise.all(
    filteredProducts.map(async (product) => {
      // If product is part of a group and is the main product
      if (
        product.commerceProductToGroups &&
        product.commerceProductToGroups.length > 0 &&
        product.commerceProductToGroups.some((group) => group.isMain)
      ) {
        const groupId = product.commerceProductToGroups[0].groupId

        try {
          // Fetch group items
          const groupResponse = await getProductGroupItems(groupId)

          // If we have group items, find the first non-main product to use as the target
          if (groupResponse && groupResponse.length > 0) {
            // Find the first non-main product in the group
            const firstVariant = groupResponse.find((item) => !item.isMain)

            if (firstVariant) {
              // Return the main product with the first variant's ID for linking
              return {
                ...product,
                groupItems: groupResponse,
                targetProductId: firstVariant.productId, // This will be used for the link
              }
            }
          }

          // Return product with group items but no target ID if no variants found
          return {
            ...product,
            groupItems: groupResponse,
          }
        } catch (error) {
          console.error(
            `Error fetching group items for product ${product.id}:`,
            error
          )
          return product
        }
      }

      // Return product as is if not part of a group or not the main product
      return product
    })
  )

  return productsWithVariants
}
