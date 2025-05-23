import { getProducts } from '@/lib/commerce-api'
import ProductsCarousel from './products-carousel'


export default async function MoreProducts() {
  const products = await getProducts()
  return (
    <div className=''>

<ProductsCarousel products={products} >
      <h4 className='headline-h3'>Още предложения</h4>

</ProductsCarousel>
    </div>
  )
}