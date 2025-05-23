'use client'

import { useCart } from '@/providers/cart.provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Bookmark, Minus, Plus, Trash } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

export default function CartTable() {
  const { cart, removeItemFromCart, updateItemQuantity, clearCart } = useCart()
  console.log('🛒 Cart items:',cart?.items)

  if (!cart || cart.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
          Твоята количка e празна
        </h3>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
          Добави продукти в количката и те ще бъдат показани тук.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='flex items-center justify-between p-4 border-b h-16'>
        <span className='body-20-medium'>Твоята количка</span>
        <Button variant={'ghost'} onClick={() => clearCart()}>
          <Trash className='h-4 w-4 mr-2' />
          премахни всички
        </Button>
      </div>
      <div className='space-y-5'>
        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={removeItemFromCart}
            onUpdateQuantity={updateItemQuantity}
          />
        ))}
      </div>
    </>
  )
}

type CartItemProps = {
  item: {
    id: string
    productId: string
    quantity: number
    price: number
    name: string
    image?: string
    attributes?: Record<string, string>
  }
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [size, setSize] = useState(item.attributes?.size || 'M')

  // Example available sizes
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value)
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      setQuantity(newQuantity)
      onUpdateQuantity(item.id, newQuantity)
    }
  }

  const incrementQuantity = () => {
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    onUpdateQuantity(item.id, newQuantity)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      onUpdateQuantity(item.id, newQuantity)
    }
  }

  const handleSizeChange = (newSize: string) => {
    setSize(newSize)
    console.log(`Size changed to ${newSize} for item ${item.id}`)
  }

  const handleBookmark = () => {
    console.log(`Bookmarked item ${item.id}`)
  }

  const color = item?.attributes?.color || null
  const category = item?.attributes?.category || null

  return (
    <div className='grid grid-cols-2 md:grid-cols-12 gap-4 items-center py-5 px-5'>
      {/* Image - Column 1 */}
      <Link
        href={`/product/${item.productId}`}
        className=' order-1 md:col-span-6 flex md:order-none gap-3 '
      >
        <div className='h-24 w-24 overflow-hidden rounded-md'>
          {item.image ? (
            <div className='relative h-full w-full'>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className='object-cover'
              />
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800'>
              <span className='text-xs text-gray-500'>No image</span>
            </div>
          )}
        </div>
        <div className='col-span-3 space-y-1'>
          <h3 className='text-base font-medium text-gray-900 dark:text-gray-100'>
            {item.name}
          </h3>

          {category && (
            <p className='text-sm text-gray-500'>Category: {category}</p>
          )}

          {color && <p className='text-sm text-gray-500'>Color: {color}</p>}
        </div>
      </Link>

      {/* Product Size Dropdown - Column 3 */}
      <div className='order-3 md:col-span-2 space-y-2 md:order-none '>
        <p>Размер</p>
        <Select value={size} onValueChange={handleSizeChange}>
          <SelectTrigger className='w-[120px] bg-transparent'>
            <SelectValue placeholder='Select size' />
          </SelectTrigger>
          <SelectContent>
            {availableSizes.map((sizeOption) => (
              <SelectItem key={sizeOption} value={sizeOption}>
                {sizeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity - Column 4 */}
      <div className=' order-4 md:col-span-2 space-y-2 md:order-none '>
        <p>Количество</p>
        <div className='flex items-center'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 rounded-r-none'
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className='h-4 w-4' />
          </Button>
          <Input
            type='number'
            min='1'
            value={quantity}
            onChange={handleQuantityChange}
            className='h-8 w-14 rounded-none text-center border-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent'
          />
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 rounded-l-none'
            onClick={incrementQuantity}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Price and Action Buttons - Column 5 */}
      <div className='order-2 md:col-span-2  md:order-none flex flex-col items-end md:space-y-2'>
        <p className='text-base font-medium text-gray-900 dark:text-gray-100 hidden md:block'>
          €{item.price.toFixed(2)}
        </p>

        <div className='flex space-x-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={handleBookmark}
          >
            <Bookmark className='h-4 w-4' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 '
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div className=' order-5 colspan-full md:order-none block md:hidden'>
        <p className='text-base font-medium text-gray-900 dark:text-gray-100'>
          €{item.price.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
