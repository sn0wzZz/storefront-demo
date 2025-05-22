import axios, { AxiosRequestConfig } from 'axios'
import { CategoriesResponse, CategoryResponse } from '@/types/categoires'
import { filterGroupProducts, GroupProductItem, Product, ProductGroupResponse, ProductResponse, ProductsResponse } from '@/types/product'
import { StoreResponse, StoresResponse } from '@/types/store'

const apiClient = axios.create({
  headers: {
    Authorization: `${process.env.API_KEY}`,
    'Content-Type': 'application/json',
  },
})

async function fetchApi<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
  const storeId = process.env.NEXT_PUBLIC_API_SPACE
  const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN

  const url = `${baseUrl}/api/v1/${workspaceId}/commerce/stores/${storeId}${endpoint}`

  try {
    const response = await apiClient.request<T>({
      url,
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-store',
      },
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching from ${endpoint}:`, error.message)
      throw new Error(
        `API error: ${error.response?.status} ${
          error.response?.statusText || error.message
        }`
      )
    }
    console.error(`Error fetching from ${endpoint}:`, error)
    throw error
  }
}

/**
 * Get detailed store information
 */
export async function getStore(): Promise<StoreResponse> {
  try {
    const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN

    const url = `${baseUrl}/api/v1/${workspaceId}/commerce/stores/${process.env.NEXT_PUBLIC_API_SPACE}`

    const response = await apiClient.request<StoreResponse>({
      url,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error in getStore:', error)
    return {
      success: false,
      data: null as unknown as StoreResponse['data'],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get list of stores with pagination
 * @param page Page number (starts at 1)
 * @param pageSize Number of items per page
 * @returns List of stores with pagination metadata
 */
export async function getStores(
  page = 1,
  pageSize = 10
): Promise<StoresResponse> {
  try {
    const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN

    const url = `${baseUrl}/api/v1/${workspaceId}/commerce/stores`

    const response = await apiClient.request<StoresResponse>({
      url,
      method: 'GET',
      params: {
        page,
        pageSize,
      },
      headers: {
        'Cache-Control': 'no-store',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error in getStores:', error)
    return {
      success: false,
      data: {
        data: [],
        meta: {
          total: 0,
          page,
          pageSize,
        },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<CategoriesResponse> {
  try {
    return await fetchApi<CategoriesResponse>('/categories')
  } catch (error) {
    console.error('Error in getCategories:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get a specific category by ID
 */
export async function getCategoryById(categoryId: string) {
  try {
    return await fetchApi<CategoryResponse>(`/categories/${categoryId}`)
  } catch (error) {
    console.error(`Error in getCategoryById for ${categoryId}:`, error)
    return null
  }
}

/**
 * Get all products from the store catalog
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetchApi<ProductsResponse>('/catalog')

    if (!response.success || !response.data) {
      return []
    }

    // Filter out products that are part of a group but are not main products
    const filteredProducts = response.data.filter(product => {
      // If the product is not part of a group, include it
      if (!product.commerceProductToGroups || product.commerceProductToGroups.length === 0) {
        return true;
      }
      
      // If the product is part of a group, check if it's the main product
      // We assume at least one of the group relationships has isMain=true
      return product.commerceProductToGroups.some(group => group.isMain === true);
    });

    // For each main product that is part of a group, fetch its variants
    const productsWithVariants = await Promise.all(
      filteredProducts.map(async (product) => {
        // If product is part of a group and is the main product
        if (product.commerceProductToGroups && 
            product.commerceProductToGroups.length > 0 && 
            product.commerceProductToGroups.some(group => group.isMain)) {
          
          const groupId = product.commerceProductToGroups[0].groupId;
          
          try {
            // Fetch group items
            const groupResponse = await getProductGroupItems(groupId);
            
            // If we have group items, find the first non-main product to use as the target
            if (groupResponse && groupResponse.length > 0) {
              // Find the first non-main product in the group
              const firstVariant = groupResponse.find(item => !item.isMain);
              
              if (firstVariant) {
                // Return the main product with the first variant's ID for linking
                return {
                  ...product,
                  groupItems: groupResponse,
                  targetProductId: firstVariant.productId // This will be used for the link
                };
              }
            }
            
            // Return product with group items but no target ID if no variants found
            return {
              ...product,
              groupItems: groupResponse
            };
          } catch (error) {
            console.error(`Error fetching group items for product ${product.id}:`, error);
            return product;
          }
        }
        
        // Return product as is if not part of a group or not the main product
        return product;
      })
    );

    return productsWithVariants;
  } catch (error) {
    console.error('Error in getProducts:', error)
    return []
  }
}




/**
 * Get a specific product by ID
 */
export async function getProductById(productId: string) {
  try {
    const response = await fetchApi<ProductResponse>(
      `/catalog/${productId}?formatOptions[richText]=html`
    )
    return response.data
  } catch (error) {
    console.error(`Error in getProductById for ${productId}:`, error)
    return null
  }
}


/**
 * Get products by category
 */
export async function getProductsByCategory(
  categoryId: string
): Promise<ProductsResponse> {
  try {
    const response = await fetchApi<ProductsResponse>(
      `/catalog?category=${categoryId}`
    )
    return response
  } catch (error) {
    console.error(`Error in getProductsByCategory for ${categoryId}:`, error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts() {
  try {
    return await fetchApi('/catalog?featured=true')
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error)
    return []
  }
}

/**
 * Get products in a product group (for configurable products)
 * @param groupId The ID of the product group
 * @returns Array of products in the group
 */
export async function getProductGroupItems(groupId: string): Promise<GroupProductItem[]> {
  try {
    const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
    const storeId = process.env.NEXT_PUBLIC_API_SPACE
    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN

    const url = `${baseUrl}/api/v1/${workspaceId}/commerce/stores/${storeId}/catalog/product-group/${groupId}`

    const response = await apiClient.request<ProductGroupResponse>({
      url,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    })

    if (!response.data.success || !response.data.data) {
      return []
    }

    // Filter out the main product
    return filterGroupProducts(response.data.data)
  } catch (error) {
    console.error(`Error in getProductGroupItems for ${groupId}:`, error)
    return []
  }
}


/**
 * Get new arrivals (recently added products)
 */
export async function getNewArrivals(limit = 8) {
  try {
    return await fetchApi(`/catalog?sort=created_at:desc&limit=${limit}`)
  } catch (error) {
    console.error('Error in getNewArrivals:', error)
    return []
  }
}

/**
 * Get products on sale (with discounts)
 */
export async function getProductsOnSale() {
  try {
    return await fetchApi('/catalog?discount_gt=0')
  } catch (error) {
    console.error('Error in getProductsOnSale:', error)
    return []
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string) {
  try {
    return await fetchApi(`/catalog?search=${encodeURIComponent(query)}`)
  } catch (error) {
    console.error(`Error in searchProducts for "${query}":`, error)
    return []
  }
}

/**
 * Get store information
 */
export async function getStoreInfo() {
  try {
    const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
    const storeId = process.env.NEXT_PUBLIC_API_SPACE
    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN

    const response = await axios.get(
      `${baseUrl}/api/v1/${workspaceId}/commerce/stores/${storeId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error in getStoreInfo:', error)
    return null
  }
}

/**
 * Get related products for a specific product
 */
export async function getRelatedProducts(productId: string, limit = 4) {
  try {
    return await fetchApi(`/catalog/${productId}/related?limit=${limit}`)
  } catch (error) {
    console.error(`Error in getRelatedProducts for ${productId}:`, error)
    return []
  }
}

/**
 * Get product reviews
 */
export async function getProductReviews(productId: string) {
  try {
    return await fetchApi(`/catalog/${productId}/reviews`)
  } catch (error) {
    console.error(`Error in getProductReviews for ${productId}:`, error)
    return []
  }
}

/**
 * Filter products with various parameters
 */
export async function filterProducts({
  category,
  minPrice,
  maxPrice,
  sort,
  page = 1,
  limit = 20,
}: {
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  limit?: number
}) {
  try {
    const queryParams = new URLSearchParams()

    if (category) queryParams.append('category', category)
    if (minPrice !== undefined)
      queryParams.append('price_gte', minPrice.toString())
    if (maxPrice !== undefined)
      queryParams.append('price_lte', maxPrice.toString())
    if (sort) queryParams.append('sort', sort)

    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    return await fetchApi(`/catalog?${queryParams.toString()}`)
  } catch (error) {
    console.error('Error in filterProducts:', error)
    return { products: [], total: 0, page, limit }
  }
}

// import { CategoriesResponse, CategoryResponse } from '@/types/categoires'
// import { Product, ProductResponse, ProductsResponse } from '@/types/product'

// // API utility functions for fetching data from the backend

// /**
//  * Base fetch function with error handling and authentication
//  */
// async function fetchApi<T>(endpoint: string, options = {}): Promise<T> {
//   const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
//   const storeId = process.env.NEXT_PUBLIC_API_SPACE
//   const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN

//   const url = `${baseUrl}/api/v1/${workspaceId}/commerce/stores/${storeId}${endpoint}`

//   const defaultOptions = {
//     headers: {
//       Authorization: `${process.env.API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     cache: 'no-store' as RequestCache, // For SSR without caching
//   }

//   try {
//     const response = await fetch(url, { ...defaultOptions, ...options })

//     if (!response.ok) {
//       throw new Error(`API error: ${response.status} ${response.statusText}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error(`Error fetching from ${endpoint}:`, error)
//     throw error
//   }
// }

// /**
//  * Get all categories
//  */
// export async function getCategories(): Promise<CategoriesResponse> {
//   try {
//     return await fetchApi<CategoriesResponse>('/categories');
//   } catch (error) {
//     console.error('Error in getCategories:', error);
//     return {
//       success: false,
//       data: [],
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// }

// /**
//  * Get a specific category by ID
//  */
// export async function getCategoryById(categoryId: string) {
//   try {
//     return await fetchApi<CategoryResponse>(`/categories/${categoryId}`);
//   } catch (error) {
//     console.error(`Error in getCategoryById for ${categoryId}:`, error);
//     return null;
//   }
// }

// /**
//  * Get all products from the store catalog
//  */
// export async function getProducts(): Promise<Product[]> {
//   try {
//     const response = await fetchApi<ProductsResponse>('/catalog')

//     if (!response.success || !response.data) {
//       return []
//     }

//     return response.data
//   } catch (error) {
//     console.error('Error in getProducts:', error)
//     return []
//   }
// }

// /**
//  * Get a specific product by ID
//  */
// export async function getProductById(productId: string) {
//   try {
//     const response = await fetchApi<ProductResponse>(`/catalog/${productId}`)
//     return response.data
//   } catch (error) {
//     console.error(`Error in getProductById for ${productId}:`, error)
//     return null
//   }
// }

// /**
//  * Get products by category
//  */
// export async function getProductsByCategory(categoryId: string): Promise<ProductsResponse> {
//   try {
//     const response = await fetchApi<ProductsResponse>(`/catalog?category=${categoryId}`)
//     return response
//   } catch (error) {
//     console.error(`Error in getProductsByCategory for ${categoryId}:`, error)
//     return {
//       success: false,
//       data: [],
//       error: error instanceof Error ? error.message : 'Unknown error'
//     }
//   }
// }

// /**
//  * Get featured products
//  */
// export async function getFeaturedProducts() {
//   try {
//     return await fetchApi('/catalog?featured=true')
//   } catch (error) {
//     console.error('Error in getFeaturedProducts:', error)
//     return []
//   }
// }

// /**
//  * Get new arrivals (recently added products)
//  */
// export async function getNewArrivals(limit = 8) {
//   try {
//     return await fetchApi(`/catalog?sort=created_at:desc&limit=${limit}`)
//   } catch (error) {
//     console.error('Error in getNewArrivals:', error)
//     return []
//   }
// }

// /**
//  * Get products on sale (with discounts)
//  */
// export async function getProductsOnSale() {
//   try {
//     return await fetchApi('/catalog?discount_gt=0')
//   } catch (error) {
//     console.error('Error in getProductsOnSale:', error)
//     return []
//   }
// }

// /**
//  * Search products
//  */
// export async function searchProducts(query: string) {
//   try {
//     return await fetchApi(`/catalog?search=${encodeURIComponent(query)}`)
//   } catch (error) {
//     console.error(`Error in searchProducts for "${query}":`, error)
//     return []
//   }
// }

// /**
//  * Get store information
//  */
// export async function getStoreInfo() {
//   try {
//     const workspaceId = process.env.NEXT_PUBLIC_API_WORKSPACE
//     const storeId = process.env.NEXT_PUBLIC_API_SPACE

//     return await fetch(
//       `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/${workspaceId}/commerce/stores/${storeId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         cache: 'no-store',
//       }
//     ).then((res) => {
//       if (!res.ok) throw new Error(`Failed to fetch store info: ${res.status}`)
//       return res.json()
//     })
//   } catch (error) {
//     console.error('Error in getStoreInfo:', error)
//     return null
//   }
// }

// /**
//  * Get related products for a specific product
//  */
// export async function getRelatedProducts(productId: string, limit = 4) {
//   try {
//     return await fetchApi(`/catalog/${productId}/related?limit=${limit}`)
//   } catch (error) {
//     console.error(`Error in getRelatedProducts for ${productId}:`, error)
//     return []
//   }
// }

// /**
//  * Get product reviews
//  */
// export async function getProductReviews(productId: string) {
//   try {
//     return await fetchApi(`/catalog/${productId}/reviews`)
//   } catch (error) {
//     console.error(`Error in getProductReviews for ${productId}:`, error)
//     return []
//   }
// }

// /**
//  * Filter products with various parameters
//  */
// export async function filterProducts({
//   category,
//   minPrice,
//   maxPrice,
//   sort,
//   page = 1,
//   limit = 20,
// }: {
//   category?: string
//   minPrice?: number
//   maxPrice?: number
//   sort?: string
//   page?: number
//   limit?: number
// }) {
//   try {
//     const queryParams = new URLSearchParams()

//     if (category) queryParams.append('category', category)
//     if (minPrice !== undefined)
//       queryParams.append('price_gte', minPrice.toString())
//     if (maxPrice !== undefined)
//       queryParams.append('price_lte', maxPrice.toString())
//     if (sort) queryParams.append('sort', sort)

//     queryParams.append('page', page.toString())
//     queryParams.append('limit', limit.toString())

//     return await fetchApi(`/catalog?${queryParams.toString()}`)
//   } catch (error) {
//     console.error('Error in filterProducts:', error)
//     return { products: [], total: 0, page, limit }
//   }
// }
