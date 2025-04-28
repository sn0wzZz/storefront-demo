'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Bookmark, Eye, MapPin, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaFile {
  url: string
}

interface ProductDetailsProps {
  name: string
  description: string
  price: number
  currency: string
  size: string
  color: string
  inventory: number
  availableSizes: string[]
  availableColors: {
    name: string
    value: string
    hex: string
    border?: boolean
  }[]
  categories: unknown[]
}

interface ProductImagesProps {
  images: MediaFile[]
  productName: string
  productDetails: ProductDetailsProps
}

export default function ProductImages({
  images,
  productName,
  productDetails,
}: ProductImagesProps) {
  const [mainImage, setMainImage] = useState<MediaFile>(
    images[0] || { url: '/placeholder.jpg' }
  )

  const handleThumbnailClick = (image: MediaFile) => {
    setMainImage(image)
  }

  return (
    <div className='relative'>
      {/* Main image with floating details */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Left column - Images */}
        <div className='space-y-4 md:col-span-full'>
          <div className='relative h-[300px] sm:h-[500px] md:h-[700px] w-full rounded-lg bg-gray-100 flex items-center mb-32'>
            <Image
              src={mainImage?.url || '/placeholder.jpg'}
              alt={productName || 'Product image'}
              fill
              className='object-contain'
            />

            {/* Mobile thumbnails - horizontal scroll */}
            <div className='absolute -bottom-32 left-0 right-0 p-2 bg-white/80 md:hidden'>
              <div className='overflow-x-auto'>
                <div className='flex space-x-2 py-2'>
                  {images?.map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-[100px] h-[100px] sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer `}
                      onClick={() => handleThumbnailClick(image)}
                    >
                      <Image
                        src={image.url || '/placeholder.jpg'}
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
              <div className='h-full overflow-y-auto seld-center rtl'>
                <div
                  className={cn(
                    'flex flex-col space-y-2 ',
                    images.length > 3 && 'ml-2'
                  )}
                >
                  {images?.map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-[148px] h-[148px] flex-shrink-0 rounded-md overflow-hidden cursor-pointer `}
                      onClick={() => handleThumbnailClick(image)}
                    >
                      <Image
                        src={image.url || '/placeholder.jpg'}
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
            <div className='hidden md:block absolute right-6 top-6 bottom-6 w-1/3 max-w-md bg-white/90 backdrop-blur-sm p-6 overflow-y-auto border '>
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

                {/* Description */}
                <p className='text-gray-600 text-sm'>
                  {productDetails.description}
                </p>

                {/* Sizes */}
                <div className='space-y-2'>
                  <h3 className='font-medium text-sm'>Size</h3>
                  <div className='grid grid-cols-3 gap-3'>
                    {productDetails.availableSizes.map((sizeOption) => (
                      <button
                        key={sizeOption}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          productDetails.size === sizeOption
                            ? 'bg-black text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className='space-y-2'>
                  <h3 className='font-medium text-sm'>Color</h3>
                  <div className='flex space-x-2'>
                    {productDetails.availableColors.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        className={`w-6 h-6 rounded-full ${
                          colorOption.border ? 'border border-gray-300' : ''
                        } ${
                          productDetails.color === colorOption.value
                            ? 'ring-2 ring-offset-1 ring-black'
                            : ''
                        }`}
                        style={{ backgroundColor: colorOption.hex }}
                        aria-label={`Color: ${colorOption.name}`}
                        title={colorOption.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Inventory */}
                <div className='text-xs text-gray-500'>
                  {productDetails.inventory > 0
                    ? `${productDetails.inventory} in stock`
                    : 'Out of stock'}
                </div>

                {/* Action buttons */}
                <div className='space-y-2'>
                  <button className='w-full py-2 px-3 bg-black text-white rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-gray-800 text-sm'>
                    <ShoppingBag className='w-4 h-4' />
                    <span>Add to Cart</span>
                  </button>

                  <button className='w-full py-2 px-3 border border-black rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 text-sm'>
                    <MapPin className='w-4 h-4' />
                    <span>Pick up at Store</span>
                  </button>
                </div>

                {/* Categories */}
                {productDetails.categories.length > 0 && (
                  <div className='pt-3 border-t'>
                    <h3 className='font-medium mb-2 text-sm'>Categories</h3>
                    <div className='flex flex-wrap gap-1'>
                      {productDetails.categories.map((category, index) => (
                        <span
                          key={index}
                          className='px-2 py-1 bg-gray-100 rounded-full text-xs'
                        >
                          {/* @ts-expect-error - TODO: Fix this */}
                          {category.commerceCategory?.name ||
                            `Category ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Product details for mobile */}
        <div className='space-y-6 md:hidden  mx-4 '>
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

          {/* Description */}
          <p className='text-gray-600'>{productDetails.description}</p>

          {/* Sizes */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Size</h3>
            <div className='flex flex-wrap gap-2'>
              {productDetails.availableSizes.map((sizeOption) => (
                <button
                  key={sizeOption}
                  className={`px-4 py-2 border rounded-md ${
                    productDetails.size === sizeOption
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {sizeOption}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className='space-y-2'>
            <h3 className='font-medium'>Color</h3>
            <div className='flex space-x-2'>
              {productDetails.availableColors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  className={`w-8 h-8 rounded-full ${
                    colorOption.border ? 'border border-gray-300' : ''
                  } ${
                    productDetails.color === colorOption.value
                      ? 'ring-2 ring-offset-2 ring-black'
                      : ''
                  }`}
                  style={{ backgroundColor: colorOption.hex }}
                  aria-label={`Color: ${colorOption.name}`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className='text-sm text-gray-500'>
            {productDetails.inventory > 0
              ? `${productDetails.inventory} in stock`
              : 'Out of stock'}
          </div>

          {/* Action buttons */}
          <div className='space-y-3'>
            <button className='w-full py-3 px-4 bg-black text-white rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-gray-800'>
              <ShoppingBag className='w-5 h-5' />
              <span>Add to Cart</span>
            </button>

            <button className='w-full py-3 px-4 border border-black rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-gray-50'>
              <MapPin className='w-5 h-5' />
              <span>Pick up at Store</span>
            </button>
          </div>

          {/* Categories */}
          {productDetails.categories.length > 0 && (
            <div className='pt-4 border-t'>
              <h3 className='font-medium mb-2'>Categories</h3>
              <div className='flex flex-wrap gap-2'>
                {productDetails.categories.map((category, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-gray-100 rounded-full text-sm'
                  >
                    {/* @ts-expect-error - TODO: Fix this */}
                    {category.commerceCategory?.name || `Category ${index + 1}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
