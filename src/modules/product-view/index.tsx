'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Bookmark, Eye, Package2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/cart.provider'

interface MediaFile {
  url: string
}

interface ProductVariant {
  id: string
  price: number
  inventory: number
  images: MediaFile[]
}

interface ProductDetailsProps {
  name: string
  description?:
    | string
    | {
        root: {
          children: unknown[]
          direction: string | null
          format: string
          indent: number
          type: string
          version: number
        }
      }
  price: number
  currency: string
  inventory: number
  availableSizes: string[]
  availableColors: {
    name: string
    value: string
    hex: string
    border?: boolean
  }[]
  categories: unknown[]
  isConfigurable?: boolean
  variants?: Record<string, ProductVariant>
}

interface ProductViewProps {
  id: string
  images: MediaFile[]
  productName: string
  productDetails: ProductDetailsProps
  variants?: unknown[]
}

export default function ProductView({
  id,
  images,
  productName,
  productDetails,
}: ProductViewProps) {
  const { addItemToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(
    null
  )
  const [mainImage, setMainImage] = useState<MediaFile>(
    images[0] || { url: '/item.jpg' }
  )
  const [currentImages, setCurrentImages] = useState<MediaFile[]>(images)
  const [currentPrice, setCurrentPrice] = useState<number>(productDetails.price)
  const [currentInventory, setCurrentInventory] = useState<number>(
    productDetails.inventory
  )

  // Update the current variant when size or color changes
  useEffect(() => {
    if (productDetails.isConfigurable && selectedSize && selectedColor) {
      const variantKey = `${selectedSize}_${selectedColor}`
      const variant = productDetails.variants?.[variantKey]

      if (variant) {
        setCurrentVariant(variant)
        setCurrentPrice(variant.price)
        setCurrentInventory(variant.inventory)

        // Update images if the variant has its own images
        if (variant.images && variant.images.length > 0) {
          setCurrentImages(variant.images)
          setMainImage(variant.images[0])
        } else {
          // Fallback to main product images
          setCurrentImages(images)
          setMainImage(images[0] || { url: '/item.jpg' })
        }
      } else {
        setCurrentVariant(null)
        setCurrentPrice(productDetails.price)
        setCurrentInventory(productDetails.inventory)
        setCurrentImages(images)
        setMainImage(images[0] || { url: '/item.jpg' })
      }
    } else {
      // Reset to default if no variant is selected
      setCurrentVariant(null)
      setCurrentPrice(productDetails.price)
      setCurrentInventory(productDetails.inventory)
      setCurrentImages(images)
      setMainImage(images[0] || { url: '/item.jpg' })
    }
  }, [selectedSize, selectedColor, productDetails, images])

  const handleThumbnailClick = (image: MediaFile) => {
    setMainImage(image)
  }

  const handleAddToCart = () => {
    // If this is a configurable product, add the selected variant to cart
    if (productDetails.isConfigurable && currentVariant) {
      addItemToCart({
        productId: currentVariant.id,
        quantity: 1,
        price: currentVariant.price,
        name: `${productName} - ${selectedSize} ${selectedColor}`,
        image:
          currentVariant.images?.[0]?.url ||
          currentImages[0]?.url ||
          '/item.jpg',
        attributes: {
          size: selectedSize || '',
          color: selectedColor || '',
        },
      })
    } else {
      // Otherwise add the main product
      addItemToCart({
        productId: id,
        quantity: 1,
        price: productDetails.price,
        name: productName,
        image: images.at(0)?.url || '/item.jpg',
        attributes: {
          size: selectedSize || '',
          color: selectedColor || '',
        },
      })
    }
  }

  // Check if the product is available to add to cart
  const isProductAvailable = productDetails.isConfigurable
    ? !!selectedSize && !!selectedColor && currentInventory > 0
    : currentInventory > 0

  return (
    <div className='relative'>
      {/* Main image with floating details */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Left column - Images */}
        <div className='space-y-4 md:col-span-full'>
          <div className='relative h-[300px] sm:h-[500px] md:h-[700px] w-full rounded-lg bg-gray-100 flex items-center mb-32'>
            <Image
              src={mainImage?.url || '/item.png'}
              alt={productName || 'Product image'}
              fill
              className='object-contain'
            />

            {/* Mobile thumbnails - horizontal scroll */}
            <div className='absolute -bottom-32  left-0 right-0 p-2  md:hidden'>
              <div className='overflow-x-auto'>
                <div className='flex  py-2'>
                  {currentImages?.map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-[100px] h-[100px] border flex-shrink-0 rounded-md overflow-hidden cursor-pointer `}
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
              <div className='h-full overflow-y-auto seld-center rtl'>
                <div
                  className={cn(
                    'flex flex-col  ',
                    currentImages.length > 3 && 'ml-2'
                  )}
                >
                  {currentImages?.map((image, index) => (
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
            <div className='hidden md:block absolute right-6 top-6 w-1/3 max-w-md bg-white/90 backdrop-blur-sm p-6 overflow-y-auto border '>
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
                  {currentPrice.toFixed(2)}
                </div>

                {/* Description */}
                <p className='text-gray-600 text-sm'>
                  {typeof productDetails.description === 'string'
                    ? productDetails.description
                    : ''}
                </p>

                {/* Colors - Only show if there are available colors */}
                {productDetails.availableColors.length > 0 && (
                  <div className='space-y-2'>
                    <h3 className='font-medium text-sm'>Color</h3>
                    <div className='flex space-x-2'>
                      {productDetails.availableColors.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          className={`w-6 h-6 rounded-full ${
                            colorOption.border ? 'border border-gray-300' : ''
                          } ${
                            selectedColor === colorOption.value
                              ? 'ring-2 ring-offset-1 ring-black'
                              : ''
                          }`}
                          style={{ backgroundColor: colorOption.hex }}
                          aria-label={`Color: ${colorOption.name}`}
                          title={colorOption.name}
                          onClick={() => setSelectedColor(colorOption.value)}
                        />
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
                  {currentInventory > 0
                    ? `${currentInventory} in stock`
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
            {currentPrice.toFixed(2)}
          </div>

          {/* Description */}
          {typeof productDetails.description === 'string' && (
            <p className='text-gray-600'>{productDetails.description}</p>
          )}

          {/* Colors - Only show if there are available colors */}
          {productDetails.availableColors.length > 0 && (
            <div className='space-y-2'>
              <h3 className='font-medium'>Color</h3>
              <div className='flex space-x-2'>
                {productDetails.availableColors.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    className={`w-8 h-8 rounded-full ${
                      colorOption.border ? 'border border-gray-300' : ''
                    } ${
                      selectedColor === colorOption.value
                        ? 'ring-2 ring-offset-2 ring-black'
                        : ''
                    }`}
                    style={{ backgroundColor: colorOption.hex }}
                    aria-label={`Color: ${colorOption.name}`}
                    title={colorOption.name}
                    onClick={() => setSelectedColor(colorOption.value)}
                  />
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
            {currentInventory > 0
              ? `${currentInventory} in stock`
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
