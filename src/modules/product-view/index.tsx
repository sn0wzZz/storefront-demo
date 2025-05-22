'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Bookmark, Eye, Package2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/cart.provider'
import { ProductVariantDisplay } from '@/types/product'

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
  variants
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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Left column - Images */}
        <div className='space-y-4 md:col-span-full'>
          <div className='relative h-[300px] sm:h-[500px] md:h-[700px] w-full rounded-lg bg-gray-100 flex items-center mb-32'>
            <Image
              src={mainImage?.url || '/item.png'}
              alt={productName || 'Product image'}
              fill
              className='object-contain max-w-max mx-auto'
            />

            {/* Mobile thumbnails - horizontal scroll */}
            <div className='absolute -bottom-32 left-0 right-0 p-2 md:hidden'>
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
            <div className='hidden md:block my-auto absolute left-0 top-0 bottom-0 p-2 m-6 bg-white/90 z-20 max-h-[512px]'>
              <div className='h-full overflow-y-auto'>
                <div
                  className={cn('flex flex-col', images.length > 3 && 'ml-2')}
                >
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
            <div className='hidden md:block absolute right-6 top-16 w-1/3 max-w-md bg-white/90 backdrop-blur-sm p-6 overflow-y-auto border'>
              <div className='space-y-6'>
                {/* Product name and bookmark */}
                <div className='flex justify-between items-start'>
                  <h1 className='text-2xl font-bold'>{productDetails.name}</h1>
                  <button
                    className='p-2 rounded-full hover:bg-gray-100'
                    aria-label='Bookmark'
                  >
                    <Bookmark className='w-5 h-5 text-gray-500' />
                  </button>
                </div>

                {/* Price */}
                <div className='text-xl font-semibold'>
                  {productDetails.currency}
                  {productDetails.price.toFixed(2)}
                </div>

                {/* Variants - Only show if there are available variants */}
                {variants && variants.length > 0 && (
                  <div className='space-y-2'>
                    <h3 className='font-medium text-sm'>Variants</h3>
                    <div className='grid grid-cols-2 gap-3'>
                      {variants.map((variant) => (
                        <a
                          key={variant.id}
                          href={`/product/${variant.id}`}
                          className='flex items-center p-2 border rounded-md hover:bg-gray-50 transition-colors'
                        >
                          {variant.images && variant.images[0] && (
                            <div className='relative w-10 h-10 mr-2'>
                              <Image
                                src={variant.images[0].url}
                                alt={variant.name || 'Variant'}
                                fill
                                className='object-cover rounded'
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
                  <div className='space-y-2'>
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
                <div className='text-xs text-gray-500'>
                  {productDetails.inventory > 0
                    ? `${productDetails.inventory} in stock`
                    : 'Out of stock'}
                </div>

                {/* Action buttons */}
                <div className='space-y-2'>
                  <Button
                    onClick={handleAddToCart}
                    className='w-full'
                    disabled={!isProductAvailable}
                  >
                    <Plus className='h-6 w-6' />
                    ADD TO CART
                  </Button>

                  <Button variant='outline' className='w-full'>
                    <Package2 className='w-4 h-4' />
                    <span>PICK AT STORE</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Product details for mobile */}
        <div className='space-y-6 md:hidden mx-4'>
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
              <div className='grid grid-cols-1 gap-3'>
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
                        {variant.size && `Size: ${variant.size}`}
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
              ? `${productDetails.inventory} in stock`
              : 'Out of stock'}
          </div>

          {/* Action buttons */}
          <div className='space-y-2'>
            <Button
              className='w-full'
              onClick={handleAddToCart}
              disabled={!isProductAvailable}
            >
              <Plus className='w-4 h-4' />
              <span>ADD TO CART</span>
            </Button>

            <Button variant='outline' className='w-full'>
              <Package2 className='w-4 h-4' />
              <span>PICK AT STORE</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

