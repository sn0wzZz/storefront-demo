'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Bookmark, Eye, Package2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/cart.provider'
import { ProductVariantDisplay } from '@/types/product'
import ProductAccordion from '@/components/dropdown-box'

interface MediaFile {
  url: string
}

interface ProductDetailsProps {
  name: string
  description?: string | object
  price: number
  currency: string
  inventory: number
  availableSizes: string[]
  availableColors?: {
    name: string
    value: string
    hex: string
    border?: boolean
  }[]
}

interface ProductViewProps {
  id: string
  images: MediaFile[]
  productName: string
  productDetails: ProductDetailsProps
  variants?: ProductVariantDisplay[] // Simplified type for variants
}

export default function ProductView({
  id,
  images,
  productName,
  productDetails,
  variants,
}: ProductViewProps) {
  const { addItemToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const [mainImage, setMainImage] = useState<MediaFile>(
    images[0] || { url: '/home/item.png' }
  )

  // Simplified - no need to track current variant, price, inventory separately
  const isProductAvailable =
    productDetails.inventory > 0 &&
    (!productDetails.availableSizes.length || selectedSize)

  const handleThumbnailClick = (image: MediaFile) => {
    setMainImage(image)
  }

  const handleAddToCart = () => {
    addItemToCart({
      productId: id,
      quantity: 1,
      price: productDetails.price,
      name: productName,
      image: images[0]?.url || '/home/item.png',
      attributes: {
        size: selectedSize || '',
      },
    })
  }

  return (
    <div className='relative'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6 border-b'>
        {/* Left column - Images */}
        <div className='relative space-y-4 md:col-span-full h-[400px] md:h-[700px] lg:h-[1024px] mb-24 flex items-center xl:justify-center '>
          <div className='relative h-[300px]  md:h-[700px] w-full rounded-lg  flex items-center '>
            <Image
              src={mainImage?.url || '/item.png'}
              alt={productName || 'Product image'}
              fill
              className='object-contain max-w-max mx-auto'
            />
          </div>
          {/* Mobile thumbnails - horizontal scroll */}
          <div className='absolute -bottom-36 left-0 right-0 p-2 lg:hidden'>
            <div className='overflow-x-auto'>
              <div className='flex py-2'>
                {images?.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-[100px] h-[100px] border flex-shrink-0 rounded-md overflow-hidden cursor-pointer`}
                    onClick={() => handleThumbnailClick(image)}
                  >
                    <Image
                      src={image.url || '/item.png'}
                      alt={`${productName || 'Product'} - view ${index + 1}`}
                      fill
                      className='object-cover'
                    />
                    {mainImage.url === image.url && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='rounded-full bg-white/70 w-8 h-8 flex items-center justify-center'>
                          <Eye className='h-5 w-5' />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop thumbnails - vertical layout */}
          <div className='hidden lg:block my-auto absolute left-0 top-0 bottom-0 p-2 m-6 bg-white/90 z-20 max-h-[512px]'>
            <div className='h-full overflow-y-auto'>
              <div className={cn('flex flex-col', images.length > 3 && 'ml-2')}>
                {images?.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-[148px] h-[148px] flex-shrink-0 rounded-md overflow-hidden cursor-pointer border`}
                    onClick={() => handleThumbnailClick(image)}
                  >
                    <Image
                      src={image.url || '/item.png'}
                      alt={`${productName || 'Product'} - view ${index + 1}`}
                      fill
                      className='object-cover'
                    />
                    {mainImage.url === image.url && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='rounded-full bg-white/70 w-12 h-12 flex items-center justify-center'>
                          <Eye className='h-6 w-6' />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Floating product details - visible on larger screens */}
          <div className='hidden lg:block absolute right-6 top-16 w-1/3 max-w-[429px] bg-white/90 backdrop-blur-sm  overflow-y-auto '>
            <div className='space-y-6 '>
              {/* Product name and bookmark */}
              <div className='flex justify-between items-start p-6 pb-0'>
                <h1 className='text-2xl font-bold'>{productDetails.name}</h1>
                <button
                  className='p-2 rounded-full hover:bg-gray-100'
                  aria-label='Bookmark'
                >
                  <Bookmark className='w-5 h-5 text-gray-500' />
                </button>
              </div>
              {/* Price */}
              <div className='text-xl font-semibold px-6'>
                {productDetails.currency}
                {productDetails.price.toFixed(2)}
              </div>
              <hr />
              {/* Description */}
              <div dangerouslySetInnerHTML={{ __html: productDetails.description ??'' }} className='px-6 ' />

              
              {/* Variants - Only show if there are available variants */}
              {variants && variants.length > 0 && (
                <div className='space-y-2 px-6'>
                  <h3 className='font-medium text-sm'>Variants</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {variants.map((variant) => (
                      <a
                        key={variant.id}
                        href={`/product/${variant.id}`}
                        className='flex items-center p-2 border  hover:bg-gray-50 transition-colors'
                      >
                        {variant.images && variant.images[0] && (
                          <div className='relative w-12 h-14 mr-2'>
                            <Image
                              src={variant.images[0].url}
                              alt={variant.name || 'Variant'}
                              fill
                              className='object-cover '
                            />
                          </div>
                        )}
                        <div className='flex-1'>
                          <div className='text-xs font-medium'>
                            {variant.name && variant.name}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {productDetails.currency}
                            {variant.price.toFixed(2)}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes - Only show if there are available sizes */}
              {productDetails.availableSizes.length > 0 && (
                <div className='space-y-2 px-6'>
                  <h3 className='font-medium text-sm'>Size</h3>
                  <div className='grid grid-cols-3 gap-3'>
                    {productDetails.availableSizes.map((sizeOption) => (
                      <button
                        key={sizeOption}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          selectedSize === sizeOption
                            ? 'bg-black text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedSize(sizeOption)}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory */}
              <div className='text-xs text-gray-500 px-6'>
                {productDetails.inventory > 0
                  ? `${productDetails.inventory} in stock`
                  : 'Out of stock'}
              </div>
              <hr />
              {/* Action buttons */}
              <div className='space-y-2 px-6'>
                <Button
                  onClick={handleAddToCart}
                  className='w-full'
                  disabled={!isProductAvailable}
                >
                  <Plus className='h-8 w-8' />
                  Добави в количката
                </Button>

                {/* <Button variant='outline' className='w-full'>
                  <Package2 className='w-4 h-4' />
                  <span>PICK AT STORE</span>
                </Button> */}
              </div>
              <div>
                <div className='relative  p-6 '>
                  <div>
                    <Image
                      src='/misc/decoration.svg'
                      width={72}
                      height={72}
                      alt='decoration'
                      className='absolute top-0 right-0 -z-10'
                    />
                  </div>
                  <p className='body-20-medium'>
                    Не си сигурен за този продукт?
                  </p>
                  <p>
                    Ние ще ти помогнем да избереш правилният размер и подходящ
                    модел.
                  </p>
                </div>
                <hr />
                <div className='p-6'>
                  <Button
                    onClick={handleAddToCart}
                    className='w-full'
                    variant={'outline'}
                  >
                    Свържи се с нас!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Product details for mobile */}
        <div className='space-y-6 lg:hidden mx-4 '>
          {/* Product name and bookmark */}
          <div className='flex justify-between items-start'>
            <h1 className='text-3xl font-bold'>{productDetails.name}</h1>
            <button
              className='p-2 rounded-full hover:bg-gray-100'
              aria-label='Bookmark'
            >
              <Bookmark className='w-6 h-6 text-gray-500' />
            </button>
          </div>

          {/* Price */}
          <div className='text-2xl font-semibold'>
            {productDetails.currency}
            {productDetails.price.toFixed(2)}
          </div>

          {/* Variants - Only show if there are available variants (mobile view) */}
          {variants && variants.length > 0 && (
            <div className='space-y-2'>
              <h3 className='font-medium'>Variants</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3'>
                {variants.map((variant) => (
                  <a
                    key={variant.id}
                    href={`/product/${variant.id}`}
                    className='flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors'
                  >
                    {variant.images && variant.images[0] && (
                      <div className='relative w-12 h-12 mr-3'>
                        <Image
                          src={variant.images[0].url}
                          alt={variant.name || 'Variant'}
                          fill
                          className='object-cover rounded'
                        />
                      </div>
                    )}
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>
                        {variant.name && variant.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {productDetails.currency}
                        {variant.price.toFixed(2)}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sizes - Only show if there are available sizes */}
          {productDetails.availableSizes.length > 0 && (
            <div className='space-y-2'>
              <h3 className='font-medium'>Size</h3>
              <div className='grid grid-cols-3 gap-3'>
                {productDetails.availableSizes.map((sizeOption) => (
                  <button
                    key={sizeOption}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === sizeOption
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSize(sizeOption)}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inventory */}
          <div className='text-sm text-gray-500'>
            {productDetails.inventory > 0
              ? `${productDetails.inventory} в наличност`
              : 'Няма в наличност'}
          </div>

          {/* Action buttons */}
          <div className='space-y-2 '>
            <Button
              onClick={handleAddToCart}
              className='w-full'
              disabled={!isProductAvailable}
            >
              <Plus className='h-8 w-8' />
              Добави в количката
            </Button>

            {/* <Button variant='outline' className='w-full'>
              <Package2 className='w-4 h-4' />
              <span>PICK AT STORE</span>
            </Button> */}
          </div>
        </div>
      </div>

      {/* Product details for desktop */}

      <div className='h-max relative  flex flex-col lg:flex-row border-b'>
        <div className='h-full  lg:w-[calc(100%-429px)] p-6 '>
          <ProductAccordion />
        </div>
        <div className='w-full lg:max-w-[429px] h-inherit border-l p-6 space-y-6'>
          <div className='p-2 border space-y-2'>
            <div className='w-full  h-[350px] lg:h-[229px] relative'>

            <Image src='/misc/box.png' alt='box' fill className='object-cover' />
            </div>
            <div className='p-2'>
              <h3 className='body-20-medium'>За кутията?</h3>
              <p>
                Всички наши пратки идват в специална кутия и подарък от нас.
                Може да персонализирате вашата кутия след връзка с оператор.
              </p>
            </div>
          </div>

          <div className=' border space-y-2'>
            <h3 className='body-20-medium p-4 pb-2 '>Поддържка на дрехите</h3>
            <hr />
            <ul className='px-4 pb-4 [&_li]:list-disc ml-4 space-y-2'>
              <li>Да не се пере на повече от 30 градуса</li>
              <li>Не използвайте белина</li>
              <li>Да не се глади на повече от 110 с ютия</li>
              <li>Не подлагайте на химическо чистене.</li>
              <li>Не сушете в сушилня</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
