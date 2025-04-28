import Logo from '../logo'
import Categories from './categories'
import HeaderActions from './header-actions'
import { getCategories } from '@/lib/api'

export default async function Navigation() {
  // Fetch categories using the server component
  const categories = await getCategories()
  console.log(categories)

  return (
    <header className='w-full bg-background h-16 fixed top-0 z-[999]'>
      <div className='container max-w-[2560px] mx-auto h-full flex items-center justify-between px-4'>
        <Categories categories={categories} />
        <div className='flex items-center'>
          <Logo />
        </div>

        <HeaderActions />
      </div>
    </header>
  )
}
