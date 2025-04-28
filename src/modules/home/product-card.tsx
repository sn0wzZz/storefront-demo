'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { BadgePercent, Plus, Bookmark } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    discount?: number
    images: string[]
  }
  onAddToCart?: (product: unknown, size: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showSizePanel, setShowSizePanel] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Available sizes
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  // Calculate discounted price if discount exists
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : null

  // Handle click outside to close the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSizePanel &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowSizePanel(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSizePanel])

  const handleAddToCart = () => {
    if (onAddToCart && selectedSize) {
      onAddToCart(product, selectedSize)
      setShowSizePanel(false)
      setSelectedSize(null)
    }
  }

  const toggleSizePanel = () => {
    setShowSizePanel(!showSizePanel)
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  // Use a default image if no images are available
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : ['/home/item.png']

  return (
    <Card className='overflow-hidden h-full max-h-[480px]  flex flex-col relative gap-0'>
      <div className='relative bg-muted z-10'>
        <AspectRatio ratio={3 / 3}>
          <Image
            src={productImages[currentImageIndex]}
            alt={product.name}
            fill
            className='object-cover transition-all'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw z-0'
          />
        </AspectRatio>

        {/* Bookmark icon */}
        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={toggleBookmark}
          className='absolute top-2 right-2 p-2 transition-colors'
        >
          <Bookmark
            className={`h-5 w-5 ${
              isBookmarked ? 'fill-primary text-primary' : 'text-gray-500'
            }`}
          />
        </Button>

        {/* Plus icon */}
        <Button
          ref={buttonRef}
          size={'icon'}
          variant={'ghost'}
          onClick={toggleSizePanel}
          className='absolute bottom-2 right-2 p-2 bg-background text-primary border transition-colors'
        >
          <Plus className='h-5 w-5' />
        </Button>

        {product.discount && product.discount > 0 && (
          <Badge className='absolute top-2 left-2 bg-destructive pl-1 py-0 h-[28px]'>
            <div className='pr-1 border-r border-destructive-muted h-full flex items-center'>
              <BadgePercent className='h-[18px] w-[18px]' />
            </div>
            {product.discount}% OFF
          </Badge>
        )}

        {productImages.length > 1 && (
          <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-1'>
            {productImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showSizePanel && (
            <motion.div
              ref={panelRef}
              className='absolute w-full bottom-[0] left-0 right-0 bg-background flex flex-col '
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex justify-between items-center p-4'>
                <h3 className='font-medium'>Select Size</h3>
                <a
                  href='#'
                  className='text-sm text-primary underline underline-offset-4'
                >
                  SIZE CHART
                </a>
              </div>

              <div className='grid grid-cols-3 gap-2 mb-4 px-4'>
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`border p-2 rounded-md ${
                      selectedSize === size
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className='w-full  border-y p-4'>
                <Button
                  onClick={handleAddToCart}
                  className='w-full'
                  disabled={!selectedSize}
                >
                  <Plus className='h-6 w-6' />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        <CardFooter className='flex justify-center items-center p-4 !mt-0 !z-20 bg-background '>
      <Link href={`/product/${product.id}`} className='absoulute inset-0 w-full'>
          <div className='flex items-center gap-2 justify-center  flex-col'>
            <p className='body-18-regular'>{product.name}</p>
            {discountedPrice ? (
              <div className='flex items-center gap-1'>
                <p className='font-semibold text-lg'>
                  ${discountedPrice.toFixed(2)}
                </p>
                <p className='text-sm text-destructive line-through'>
                  ${product.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className='font-semibold text-lg'>
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>
      </Link>
        </CardFooter>
    </Card>
  )
}
