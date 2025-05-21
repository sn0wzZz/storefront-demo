'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './cart.provider'
import { ReactNode } from 'react'
import { z } from 'zod'
import { CookiesProvider } from 'react-cookie'
import { CheckoutProvider } from './checkout.provider'

// Define config schema with Zod
export const configSchema = z.object({
  errorMessages: z
    .object({
      order: z.record(z.string(), z.function().returns(z.string())).optional(),
      cart: z
        .object({
          onCreate: z.function().returns(z.string()).optional(),
          onUpdate: z.function().returns(z.string()).optional(),
          onExpire: z.function().returns(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  staleTime: z.number().optional().default(60000), // 1 minute
  refetchInterval: z.number().optional().default(300000), // 5 minutes
})
export type CartConfig = z.infer<typeof configSchema>

interface TriganiCartProviderProps {
  children: ReactNode
}

const queryClient = new QueryClient()

// Define default config with functions here (in the client component)
const defaultConfig: CartConfig = {
  errorMessages: {
    cart: {
      onCreate: (error) => `Failed to create cart: ${error}`,
      onUpdate: (error) => `Failed to update cart: ${error}`,
      onExpire: (error) => `Your cart has expired: ${error}`,
    },
  },
  staleTime: 60000,
  refetchInterval: 300000,
}

export function TriganiCartProvider({ children }: TriganiCartProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CookiesProvider>
        <CartProvider config={defaultConfig}>
          <CheckoutProvider>{children}</CheckoutProvider>
        </CartProvider>
      </CookiesProvider>
    </QueryClientProvider>
  )
}
