'use client'
import Categories from './categories'
import { CategoriesResponse } from '@/types/categoires'

export default function CategoriesWrapper({
  categories,
}: {
  categories: CategoriesResponse
}) {
  return <Categories categories={categories} />
}
