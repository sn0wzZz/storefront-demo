'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { CategoriesResponse } from '@/types/categoires'

export default function Categories({
  categories,
  locale = 'en',
}: {
  categories: CategoriesResponse
  locale?: string
}) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  useEffect(() => {
    console.log('Categories component received:', categories)
  }, [categories])

  // Check if categories data exists and the request was successful
  if (!categories?.success || !categories?.data?.data) {
    console.log('No categories data available or request failed')
    return null // Return early if no data or request failed
  }

  // Filter categories by locale
  const filteredCategories = categories.data.data.filter(
    (cat) => cat.commerceLanguage.code === locale
  )

  console.log('Filtered categories for locale', locale, ':', filteredCategories)

  // Find the "clothes" category ID
  const clothesCategoryId = filteredCategories.find(
    (cat) =>
      cat.name.toLowerCase() === 'clothes' || cat.name.toLowerCase() === 'дрехи'
  )?.commerceCategory.id

  console.log('Clothes category ID:', clothesCategoryId)

  // If no clothes category is found, show all top-level categories
  const mainCategories = clothesCategoryId
    ? filteredCategories.filter(
        (cat) => cat.commerceCategory.parentId === clothesCategoryId
      )
    : filteredCategories.filter((cat) => cat.commerceCategory.parentId === null)

  console.log('Main categories:', mainCategories)

  // Get subcategories for a given category
  const getSubcategories = (categoryId: string) => {
    return filteredCategories.filter(
      (cat) => cat.commerceCategory.parentId === categoryId
    )
  }

  if (mainCategories.length === 0) {
    console.log('No main categories found')
    return null
  }

  return (
    <nav className='hidden md:flex items-center space-x-6'>
      {mainCategories.map((category) => {
        const subcategories = getSubcategories(category.commerceCategory.id)
        const hasSubcategories = subcategories.length > 0

        return (
          <div
            key={category.id}
            className='relative'
            onMouseEnter={() =>
              setHoveredCategory(category.commerceCategory.id)
            }
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className='flex items-center gap-1'>
              <Link
                href={`/category/${category.categoryId}`}
                className='text-gray-700 hover:text-primary transition-colors capitalize'
              >
                {category.name}
              </Link>
              {hasSubcategories && (
                <ChevronDown className='h-4 w-4 text-gray-500' />
              )}
            </div>

            {/* Dropdown for subcategories */}
            {hasSubcategories &&
              hoveredCategory &&
              hoveredCategory === category.commerceCategory.id && (
                <div className='absolute top-full left-0 mt-1 bg-white shadow-md rounded-md py-2 min-w-[150px] z-50'>
                  {subcategories.map((subCategory) => (
                    <Link
                      key={subCategory.id}
                      href={`/category/${subCategory.categoryId}`}
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors capitalize'
                    >
                      {subCategory.name}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        )
      })}
    </nav>
  )
}
