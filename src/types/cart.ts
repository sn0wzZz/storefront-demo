/**
 * Represents a product to be added to the cart
 */
export type ProductToAdd = {
  productId: string
  qty: number
}

/**
 * Represents customer information for the cart
 */
export type CustomerInfo = {
  name?: string
  email?: string
  phone?: string
  contactId?: string
}

/**
 * Represents a media file in the API
 */
export type MediaFile = {
  id: string
  url: string
  createdAt?: string
  updatedAt?: string
  workspaceId?: string
  key?: string
  mime?: string
  name?: string
  size?: number
  formats?: unknown[]
}

/**
 * Represents a product localization
 */
export type ProductLocalization = {
  id: string
  name: string
  languageId: string
  storeId?: string
  slug?: string
  description?: unknown
  productId?: string
  commerceLanguage?: {
    id: string
    code: string
  }
}

/**
 * Represents a product price
 */
export type ProductPrice = {
  id: string
  value: number
  type: string
  currencyId: string
  productId?: string
  createdAt?: string
  updatedAt?: string
  coreCurrency?: {
    id: string
    code: string
    name: string
    number?: string
    decimalDigits?: number
  }
}

/**
 * Represents a product image relationship
 */
export type ProductImage = {
  id: string
  productId: string
  fileId: string
  index: number
  mediaFile?: MediaFile
}

/**
 * Represents a commerce product
 */
export type CommerceProduct = {
  id: string
  createdAt?: string
  updatedAt?: string
  folio?: number
  storeId?: string
  sku?: string
  type?: string
  commerceProductsLocalizations?: ProductLocalization[]
  commerceProductsPrices?: ProductPrice[]
  relationshipsImageToCommerceProducts?: ProductImage[]
  commerceProductsInventories?: unknown[]
}

/**
 * Represents a cart item from the API
 */
export type CartItem = {
  id?: string
  cartId: string
  productId: string
  qty: number
  price?: number
  name?: string
  image?: string
  attributes?: Record<string, string>
  storeId?: string
  expiredAt?: string | null
  note?: string | null
  createdAt?: string
  updatedAt?: string
  commerceProduct?: CommerceProduct
}

/**
 * Represents a cart from the API
 */
export type Cart = {
  id: string
  workspaceId?: string
  storeId?: string
  status: 'open' | 'closed' | "active"
  items?: CartItem[]
  commerceCartItems?: CartItem[]
  total?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  contactId?: string
  createdAt?: string
  updatedAt?: string
  currencyId?: string
}

/**
 * Represents the API response structure
 */
export type ApiResponse<T> = {
  success: boolean
  data: T
  error: string | null
}

/**
 * Represents the cart API response
 */
export type CartApiResponse = ApiResponse<Cart>
