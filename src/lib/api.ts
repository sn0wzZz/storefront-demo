import { CategoriesResponse, CategoryResponse } from '@/types/categoires'
import { Product, ProductResponse, ProductsResponse } from '@/types/product'

// API utility functions for fetching data from the backend

/**
 * Base fetch function with error handling and authentication
 */
async function fetchApi<T>(endpoint: string, options = {}): Promise<T> {
  const workspaceId = process.env.API_WORKSPACE
  const storeId = process.env.API_SPACE
  const baseUrl = process.env.API_DOMAIN

  const url = `${baseUrl}/api/v1/${workspaceId}/commerce/stores/${storeId}${endpoint}`

  const defaultOptions = {
    headers: {
      Authorization: `${process.env.API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store' as RequestCache, // For SSR without caching
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error)
    throw error
  }
}




/**
 * Get all categories
 */
export async function getCategories(): Promise<CategoriesResponse> {
  try {
    return await fetchApi<CategoriesResponse>('/categories');
  } catch (error) {
    console.error('Error in getCategories:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}



/**
 * Get a specific category by ID
 */
export async function getCategoryById(categoryId: string) {
  try {
    return await fetchApi<CategoryResponse>(`/categories/${categoryId}`);
  } catch (error) {
    console.error(`Error in getCategoryById for ${categoryId}:`, error);
    return null;
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

    return response.data
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
    const response = await fetchApi<ProductResponse>(`/catalog/${productId}`)
    return response.data
  } catch (error) {
    console.error(`Error in getProductById for ${productId}:`, error)
    return null
  }
}


/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<ProductsResponse> {
  try {
    const response = await fetchApi<ProductsResponse>(`/catalog?category=${categoryId}`)
    return response
  } catch (error) {
    console.error(`Error in getProductsByCategory for ${categoryId}:`, error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
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
    const workspaceId = process.env.API_WORKSPACE
    const storeId = process.env.API_SPACE

    return await fetch(
      `${process.env.API_DOMAIN}/api/v1/${workspaceId}/commerce/stores/${storeId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    ).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch store info: ${res.status}`)
      return res.json()
    })
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
