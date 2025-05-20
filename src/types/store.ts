/**
 * Core user profile information
 */
export type CoreUserProfile = {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  email: string
  name: string
  imageUrl: string | null
  phone: string | null
  location: string | null
  jobTitle: string | null
  birthday: string | null
}

/**
 * Core user information
 */
export type CoreUser = {
  id: string
  createdAt: string
  updatedAt: string
  email: string
  emailVerified: string | null
  phone: string | null
  preferredLocale: string
  stripeCustomerId: string
  preferredTheme: string
  coreUserProfiles: CoreUserProfile[]
}

/**
 * Store language information
 */
export type CommerceLanguage = {
  id: string
  createdAt: string
  updatedAt: string
  code: string
}

/**
 * Store language relationship
 */
export type CommerceStoreToLanguage = {
  id: string
  createdAt: string
  updatedAt: string
  storeId: string
  languageId: string
  index: number
  commerceLanguage: CommerceLanguage
}

/**
 * Currency information
 */
export type CoreCurrency = {
  id: string
  createdAt: string
  updatedAt: string
  code: string
  number: string
  decimalDigits: number
  name: string
  keywords: string
}

/**
 * Store currency relationship
 */
export type CommerceStoreToCurrency = {
  id: string
  createdAt: string
  updatedAt: string
  storeId: string
  currencyId: string
  index: number
  coreCurrency: CoreCurrency
}

/**
 * Store information
 */
export type Store = {
  workspaceId: string
  id: string
  createdAt: string
  updatedAt: string
  name: string
  slug: string
  createdById: string
  coreUser: CoreUser
  commerceStoreToLanguages?: CommerceStoreToLanguage[]
  commerceStoreToCurrencies?: CommerceStoreToCurrency[]
}

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  total: number
  page: number
  pageSize: number
}

/**
 * Store API response for a single store
 */
export type StoreResponse = {
  success: boolean
  data: Store
  error: string | null
}

/**
 * Store list data structure
 */
export type StoreListData = {
  data: Store[]
  meta: PaginationMeta
}

/**
 * Store API response for multiple stores
 */
export type StoresResponse = {
  success: boolean
  data: StoreListData
  error: string | null
}
