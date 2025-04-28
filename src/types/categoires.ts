// Base entity type with common fields
interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// User profile type
export interface CoreUserProfile extends BaseEntity {
  userId: string
  email: string
  name: string
  imageUrl: string | null
  phone: string | null
  location: string | null
  jobTitle: string | null
  birthday: string | null
}

// Core user type
export interface CoreUser extends BaseEntity {
  email: string
  emailVerified: string | null
  phone: string | null
  preferredLocale: string
  stripeCustomerId: string
  preferredTheme: string
  coreUserProfiles: CoreUserProfile[]
}

// Commerce language type
export interface CommerceLanguage extends BaseEntity {
  code: string
}

// Commerce store type
export interface CommerceStore {
  workspaceId: string
  id: string
  createdAt: string
  updatedAt: string
  name: string
  slug: string
  createdById: string
}

// Commerce category type
export interface CommerceCategory extends BaseEntity {
  createdById: string
  storeId: string
  parentId: string | null
  coreUser: CoreUser
}

// Category translation type
export interface CategoryTranslation extends BaseEntity {
  languageId: string
  storeId: string
  slug: string
  name: string
  description: string
  categoryId: string
  commerceCategory: CommerceCategory
  commerceLanguage: CommerceLanguage
  commerceStore: CommerceStore
}

export interface Category extends BaseEntity {
  commerceCategoriesLocalizations: CategoryTranslation[]
}

// API response type
export interface CategoriesResponse {
  success: boolean
  data: CategoryTranslation[]
  error: string | null
}
export interface CategoryResponse {
  success: boolean
  data: Category
  error: string | null
}

// Simplified category type for UI components
export interface CategoryForDisplay {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: CategoryForDisplay[]
}
