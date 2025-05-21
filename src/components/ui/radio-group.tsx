'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot='radio-group'
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot='radio-group-item'
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot='radio-group-indicator'
        className='relative flex items-center justify-center'
      >
        <CircleIcon className='fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2' />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

interface StyledRadioItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupItem>,
    'onCheckedChange'
  > {
  icon?: React.ReactNode
  label: string
  className?: string
}
interface StyledRadioItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupItem>,
    'onCheckedChange'
  > {
  icon?: React.ReactNode
  label: string
  className?: string
  checked?: boolean // Add explicit checked prop
}

const StyledRadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  StyledRadioItemProps
>(({ className, icon, label, checked, ...props }, ref) => {
  return (
    <div
      className={cn(
        'relative flex items-center space-x-2 justify-center border w-full max-w-[217px] h-12 py-3 overflow-hidden transition-colors',
        checked ? 'border-primary' : 'border-muted',
        className
      )}
    >
      <RadioGroupItem
        ref={ref}
        {...props}
        className='absolute cursor-pointer w-full h-full opacity-0'
      />
      <div className='flex items-center space-x-1'>
        {icon}
        <label htmlFor={props.id} className='body-16-medium'>{label}</label>
      </div>
    </div>
  )
})


StyledRadioItem.displayName = 'StyledRadioItem'

export { RadioGroup, RadioGroupItem, StyledRadioItem }
