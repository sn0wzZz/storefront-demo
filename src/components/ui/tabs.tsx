'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  // Convert children to array to manipulate
  const childrenArray = React.Children.toArray(children)

  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'text-muted-foreground inline-flex h-auto w-fit items-center justify-center rounded-lg p-[3px]',
        className
      )}
      {...props}
    >
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && (
            <div className='w-32 h-[1px] border-t-2 border-dashed border-primary ' />
          )}
        </React.Fragment>
      ))}
    </TabsPrimitive.List>
  )
}



function TabsTrigger({
  className,
  icon,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  icon?: React.ReactNode
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        "bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Add a class to target the icon container when the trigger is active
        'data-[state=active]:[&_.icon-container]:bg-primary data-[state=active]:[&_.icon-container]:text-white  ',
        className
      )}
      {...props}
    >
      <div className='flex flex-col items-center gap-2 relative'>
        {icon && (
          <div
            className={cn(
              'h-12 aspect-square flex-center rounded-full transition-colors duration-200 border-[1.5px] border-primary',
              'bg-gray-200 text-gray-600 icon-container'
            )}
          >
            {icon}
          </div>
        )}
        <p className='absolute -bottom-8'>{props.children}</p>
      </div>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
