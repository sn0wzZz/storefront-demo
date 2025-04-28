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

// Product price
export interface ProductPrice extends BaseEntity {
  productId: string
  value: number
  discount?: number
  currencyId: string
  createdById: string
  type: string
  coreCurrency: {
    id: string
    createdAt: string
    updatedAt: string
    code: string
    symbol: string
    name: string
  }
}

// Product localization (previously translation)
export interface ProductLocalization extends BaseEntity {
  productId: string
  languageId: string
  storeId: string
  slug: string
  name: string
  description: string
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
    name: string
    slug: string
    description?: string
    parentId?: string
    storeId: string
  }
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
  type: string
  commerceProductsAttributesValues: ProductAttributeValue[]
  relationshipsImageToCommerceProducts: ProductImage[]
  commerceProductsInventories: ProductInventory[]
  commerceProductsPrices: ProductPrice[]
  commerceProductsLocalizations: ProductLocalization[]
  commerceProductToCategories: ProductToCategory[]
  commerceTaxesToProducts: unknown[] // Add proper type if needed
  commerceStore: CommerceStore
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

// Category response type (based on the first response you showed)
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

// API Response type
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
