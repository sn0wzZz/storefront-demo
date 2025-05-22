import Logo from '../logo'
import CategoriesWrapper from './categories-wrapper'

import HeaderActions from './header-actions'
import { getCategories, getStore } from '@/lib/commerce-api'

export default async function Navigation() {
  // Fetch categories using the server component
  const categories = await getCategories()
  const store = await getStore()

  const currencies = store.data.commerceStoreToCurrencies?.map((currency) => {
    return {
      id: currency.coreCurrency.id,
      name: currency.coreCurrency.name,
      code: currency.coreCurrency.code,
      createdAt: currency.coreCurrency.createdAt,
      updatedAt: currency.coreCurrency.updatedAt,
      number: currency.coreCurrency.number,
      decimalDigits: currency.coreCurrency.decimalDigits,
      keywords: currency.coreCurrency.keywords,
    }
  })

  return (
    <header className='w-full bg-background h-16 fixed top-0 z-[999] border-b'>
      <div className='container max-w-[2560px] mx-auto h-full flex items-center justify-between px-4'>
        <CategoriesWrapper categories={categories} />
        <div className='flex items-center'>
          <Logo />
        </div>

        <HeaderActions currencies={currencies} />
      </div>
    </header>
  )
}
