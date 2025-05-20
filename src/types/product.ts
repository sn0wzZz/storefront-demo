// Base types for common fields
interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Media file types
export interface MediaFormat {
  url: string
  width: number
  height: number
  size: number
  mime: string
}

export interface MediaFile extends BaseEntity {
  workspaceId: string
  key: string
  createdById: string
  mime: string
  name: string
  size: number
  url: string
  formats: MediaFormat[]
  folderId?: string
  mediaFileToFolders?: {
    id: string
    createdAt: string
    updatedAt: string
    folderId: string
    fileId: string
    workspaceId: string
    deletedAt: null | string
  }[]
}

// Product image relationship
export interface ProductImage extends BaseEntity {
  productId: string
  fileId: string
  index: number
  mediaFile: MediaFile
}

// Product attribute field
export interface ProductAttributeField extends BaseEntity {
  name: string
  slug: string
  description: string
  label: string
  help: string
  dataType: string
  appearance: string
  reference: null | string
  isMultiValue: boolean
  placeholder: string
  metadata: null | unknown
  width: number
  index: number
  searchable: boolean
  formReadonly: boolean
  workspaceId: string
  typeId: string
  commerceProductsAttributesType: {
    name: string
    description: string
    config: null | unknown
    workspaceId: string
    id: string
    createdAt: string
    updatedAt: string
    slug: string
  }
}

// Product attribute value
export interface ProductAttributeValue extends BaseEntity {
  fieldId: string
  rowId: string
  value: string
  type: string
  index: number
  commerceProductsAttributesField: ProductAttributeField
}

// Product inventory
export interface ProductInventory extends BaseEntity {
  unitId: string
  productId: string
  value: number
  commerceUnit: {
    id: string
    createdAt: string
    updatedAt: string
    storeId: string
    name: string
  }
}

// Currency type
export interface Currency extends BaseEntity {
  code: string
  number: string
  decimalDigits: number
  name: string
  symbol?: string
  keywords?: string
}

// Product price
export interface ProductPrice extends BaseEntity {
  productId: string
  value: number
  discount?: number
  currencyId: string
  createdById: string
  type: 'retail' | 'notax' | 'delivery'
  coreCurrency: Currency
}

// Product localization
export interface ProductLocalization extends BaseEntity {
  productId: string
  languageId: string
  storeId: string
  slug: string
  name: string
  description?: string
    | {
        root: {
          children: unknown[]
          direction: string | null
          format: string
          indent: number
          type: string
          version: number
        }
      }
  commerceLanguage: {
    id: string
    createdAt: string
    updatedAt: string
    code: string
  }
}

// Product category relationship
export interface ProductToCategory extends BaseEntity {
  categoryId: string
  productId: string
  commerceCategory: {
    id: string
    createdAt: string
    updatedAt: string
    name?: string
    slug?: string
    description?: string
    parentId?: string
    storeId: string
    createdById?: string
  }
}

// Product option relationship
export interface ProductToOption extends BaseEntity {
  optionId: string
  productId: string
}

// Product group type
export interface CommerceProductGroup extends BaseEntity {
  type: string
  storeId: string
}

// Product group relationship
export interface ProductToGroup extends BaseEntity {
  groupId: string
  productId: string
  isMain: boolean
  index: number
  commerceProductGroup?: CommerceProductGroup
}

// Store information
export interface CommerceStore extends BaseEntity {
  workspaceId: string
  name: string
  slug: string
  createdById: string
}

// Main Product type
export interface Product extends BaseEntity {
  folio: number
  storeId: string
  sku: string | null
  type: 'simple' | 'configurable' | 'bundle' | 'virtual'
  commerceProductsAttributesValues: ProductAttributeValue[]
  relationshipsImageToCommerceProducts: ProductImage[]
  commerceProductsInventories: ProductInventory[]
  commerceProductsPrices: ProductPrice[]
  commerceProductsLocalizations: ProductLocalization[]
  commerceProductToCategories: ProductToCategory[]
  commerceTaxesToProducts: unknown[] // Add proper type if needed
  commerceProductToOptions: ProductToOption[]
  commerceProductToGroups: ProductToGroup[]
  commerceStore: CommerceStore
}

// Group product item type
export interface GroupProductItem extends BaseEntity {
  groupId: string
  productId: string
  isMain: boolean
  index: number
  product?: Product
}

// API Response types
export interface ProductsResponse {
  success: boolean
  data: Product[]
  error: null | string
}

export interface ProductResponse {
  success: boolean
  data: Product
  error: null | string
}

export interface ProductGroupResponse {
  success: boolean
  data: GroupProductItem[]
  error: null | string
}

// Category response type
export interface CategoryResponse {
  success: boolean
  data: {
    id: string
    createdAt: string
    updatedAt: string
    languageId: string
    storeId: string
    slug: string
    name: string
    description: string
    categoryId: string
    commerceCategory: object
    commerceLanguage: object
    commerceStore: object
  }[]
  error: null | string
}

// Helper function to get product name in preferred language
export function getProductName(
  product: Product,
  languageCode: string = 'en'
): string {
  const localization = product.commerceProductsLocalizations.find(
    (loc) => loc.commerceLanguage.code === languageCode
  )

  if (localization && localization.name) {
    return localization.name
  }

  // Fallback to any available localization
  const anyLocalization = product.commerceProductsLocalizations.find(
    (loc) => loc.name
  )
  if (anyLocalization) {
    return anyLocalization.name
  }

  return 'Unnamed Product'
}

// Helper function to get product price in preferred currency
export function getProductPrice(
  product: Product,
  currencyCode: string = 'EUR',
  priceType: 'retail' | 'notax' | 'delivery' = 'retail'
): number {
  const price = product.commerceProductsPrices.find(
    (price) =>
      price.coreCurrency.code === currencyCode && price.type === priceType
  )

  if (price) {
    return price.value
  }

  // Fallback to any price of the requested type
  const anyPrice = product.commerceProductsPrices.find(
    (price) => price.type === priceType
  )
  if (anyPrice) {
    return anyPrice.value
  }

  return 0
}

// Helper function to check if product is configurable
export function isConfigurableProduct(product: Product): boolean {
  return product.type === 'configurable'
}

// Helper function to get product group ID for configurable products
export function getProductGroupId(product: Product): string | null {
  if (!isConfigurableProduct(product)) return null

  const mainGroup = product.commerceProductToGroups.find(
    (group) => group.isMain
  )
  return mainGroup?.groupId || null
}

// Helper function to filter out main product from group items
export function filterGroupProducts(
  groupItems: GroupProductItem[]
): GroupProductItem[] {
  return groupItems
    .filter((item) => !item.isMain)
    .sort((a, b) => a.index - b.index)
}
