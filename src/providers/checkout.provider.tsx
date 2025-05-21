'use client'

import React, { createContext, useContext, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCart } from './cart.provider'
import { toast } from 'sonner'
import { createOrder } from '@/actions/cart.actions'
import { removeCartIdCookie } from '@/lib/cookie-utils'
import { useRouter } from 'next/navigation'

// Define form schema with Zod (same as in your checkout-form.tsx)
const formSchema = z
  .object({
    deliveryType: z.enum(['delivery', 'pickup']),
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters.' }),
    lastName: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().min(6, { message: 'Please enter a valid phone number.' }),
    country: z.string().min(1, { message: 'Please select a country.' }),
    address: z
      .string()
      .min(5, { message: 'Please enter your street address.' }),
    city: z.string().min(1, { message: 'Please enter your city.' }),
    state: z.string().optional(),
    buildingType: z.string().optional(),
    postalCode: z
      .string()
      .min(1, { message: 'Please enter your postal code.' }),
    useSameForBilling: z.boolean().optional(),
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingCountry: z.string().optional(),
    billingAddress: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingPostalCode: z.string().optional(),
    billingPhone: z.string().optional(),
    billingCompany: z.string().optional(),
    billingVat: z.string().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.useSameForBilling) {
        return (
          !!data.billingFirstName &&
          !!data.billingLastName &&
          !!data.billingCountry &&
          !!data.billingAddress &&
          !!data.billingCity &&
          !!data.billingPostalCode
        )
      }
      return true
    },
    {
      message: 'Billing address information is required',
      path: ['billingFirstName'],
    }
  )

type FormValues = z.infer<typeof formSchema>

type CheckoutContextType = {
  form: UseFormReturn<FormValues>
  activeTab: string
  setActiveTab: (tab: string) => void
  nextTab: () => Promise<void>
  prevTab: () => void
  onSubmit: (data: FormValues) => Promise<void>
  isSubmitting: boolean
}

const CheckoutContext = createContext<CheckoutContextType | null>(null)

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { cart, checkout } = useCart()
  const [activeTab, setActiveTab] = useState('delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryType: 'delivery',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      address: '',
      city: '',
      state: '',
      buildingType: '',
      postalCode: '',
      useSameForBilling: true,
      note: '',
    },
  })

  const nextTab = async () => {
    if (activeTab === 'delivery') {
      // Validate delivery fields before proceeding
      const isValid = await form.trigger([
        'firstName',
        'lastName',
        'email',
        'phone',
        'country',
        'address',
        'city',
        'postalCode',
      ])

      if (isValid) {
        setActiveTab('review')
      }
    } else if (activeTab === 'review') {
      setActiveTab('payment')
    }
  }

  const prevTab = () => {
    if (activeTab === 'review') {
      setActiveTab('delivery')
    } else if (activeTab === 'payment') {
      setActiveTab('review')
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!cart) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare order data in the format expected by the API
      const orderData = {
        currencyId: '88367305-a895-4fa5-8cb0-93020a5ffc9e',
        orderCustomerName: `${data.firstName} ${data.lastName}`,
        orderCustomerEmail: data.email,
        orderCustomerPhone: data.phone,
        orderAddresses: {
          shipping: {
            name: `${data.firstName} ${data.lastName}`,
            street: data.address,
            city: data.city,
            country: data.country,
            state: data.state || '',
            zip: data.postalCode,
          },
          billing: data.useSameForBilling
            ? {
                name: `${data.firstName} ${data.lastName}`,
                street: data.address,
                city: data.city,
                country: data.country,
                state: data.state || '',
                zip: data.postalCode,
                phone: data.phone,
                note: data.note || '',
                vat: '', // Empty by default if not provided
                company: '', // Empty by default if not provided
              }
            : {
                name: `${data.billingFirstName} ${data.billingLastName}`,
                street: data.billingAddress || '',
                city: data.billingCity || '',
                country: data.billingCountry || '',
                state: data.billingState || '',
                zip: data.billingPostalCode || '',
                phone: data.billingPhone || data.phone,
                note: data.note || '',
                vat: data.billingVat || '',
                company: data.billingCompany || '',
              },
        },
      }

      // Use the server action instead of directly calling the API
      const result = await createOrder(orderData)

      // Process successful checkout
      await checkout()
      await removeCartIdCookie()
      router.replace('/order-success')
      

      toast.success('Order placed successfully')
      console.log(result)
      // You could redirect here with something like:
      // window.location.href = `/order-success?orderId=${result.id}`;
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('There was an error processing your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CheckoutContext.Provider
      value={{
        form,
        activeTab,
        setActiveTab,
        nextTab,
        prevTab,
        onSubmit,
        isSubmitting,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
