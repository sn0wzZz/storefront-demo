'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCart } from '@/providers/cart.provider'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createOrder } from '@/actions/cart.actions'
import Image from 'next/image'
import { removeCartIdCookie } from '@/lib/cookie-utils'

// Define form schema with Zod
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

// Country options
const countries = [
  { value: 'BG', label: 'Bulgaria' },
  { value: 'US', label: 'United States of America' },
  { value: 'GB', label: 'United Kingdom' },
  // Add more countries as needed
]

export function CheckoutForm() {
  const { cart, checkout } = useCart()
  const [activeTab, setActiveTab] = useState('delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryType: 'delivery' as const,
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

  const deliveryType = form.watch('deliveryType')
  const useSameForBilling = form.watch('useSameForBilling')

  // Define the submit handler without type annotations
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

  const nextTab = () => {
    if (activeTab === 'delivery') {
      // Validate delivery fields before proceeding
      form.trigger([
        'firstName',
        'lastName',
        'email',
        'phone',
        'country',
        'address',
        'city',
        'postalCode',
      ])
      const hasErrors =
        !!form.formState.errors.firstName ||
        !!form.formState.errors.lastName ||
        !!form.formState.errors.email ||
        !!form.formState.errors.phone ||
        !!form.formState.errors.country ||
        !!form.formState.errors.address ||
        !!form.formState.errors.city ||
        !!form.formState.errors.postalCode

      if (!hasErrors) {
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

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>Checkout</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='delivery'>Delivery Information</TabsTrigger>
          <TabsTrigger value='review'>Review Order</TabsTrigger>
          <TabsTrigger value='payment'>Payment</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8 mt-8'
          >
            <TabsContent value='delivery'>
              <Card className='py-6'>
                <CardHeader>
                  <CardTitle>Complete your delivery information</CardTitle>
                  <CardDescription>
                    Please provide your delivery details to complete your order.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Delivery Type */}
                  <FormField
                    control={form.control}
                    name='deliveryType'
                    render={({ field }) => (
                      <FormItem className='space-y-3'>
                        <FormLabel>Delivery type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='flex flex-row space-x-4'
                          >
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='delivery' id='delivery' />
                              <label htmlFor='delivery'>Delivery</label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='pickup' id='pickup' />
                              <label htmlFor='pickup'>Pickup</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* First Name */}
                    <FormField
                      control={form.control}
                      name='firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex: Ivan' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Last Name */}
                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex: Petrov' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Email */}
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Ex: ivan.petrov@gmail.com'
                              type='email'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name='phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input placeholder='Ex: +359888123456' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {deliveryType === 'delivery' && (
                    <>
                      {/* Country */}
                      <FormField
                        control={form.control}
                        name='country'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country/region</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select a country' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.value}
                                    value={country.value}
                                  >
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <FormField
                        control={form.control}
                        name='address'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder='Street address' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* City */}
                        <FormField
                          control={form.control}
                          name='city'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder='City' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* State */}
                        <FormField
                          control={form.control}
                          name='state'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='State/Province/Region'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Building Type */}
                        <FormField
                          control={form.control}
                          name='buildingType'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Building type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select type' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='apartment'>
                                    Apartment
                                  </SelectItem>
                                  <SelectItem value='house'>House</SelectItem>
                                  <SelectItem value='office'>Office</SelectItem>
                                  <SelectItem value='other'>Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Postal Code */}
                        <FormField
                          control={form.control}
                          name='postalCode'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal / ZIP code</FormLabel>
                              <FormControl>
                                <Input placeholder='Enter code' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Use Same for Billing */}
                  <FormField
                    control={form.control}
                    name='useSameForBilling'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>
                            Use this data for billing address
                          </FormLabel>
                          <FormDescription>
                            Check this if your billing address is the same as
                            your delivery address.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Billing Address Fields (shown only if useSameForBilling is false) */}
                  {!useSameForBilling && (
                    <div className='space-y-6 mt-6 border-t pt-6'>
                      <h3 className='text-lg font-medium'>Billing Address</h3>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Billing First Name */}
                        <FormField
                          control={form.control}
                          name='billingFirstName'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input placeholder='First name' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Billing Last Name */}
                        <FormField
                          control={form.control}
                          name='billingLastName'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input placeholder='Last name' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Billing Company */}
                      <FormField
                        control={form.control}
                        name='billingCompany'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder='Company name' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Billing VAT */}
                      <FormField
                        control={form.control}
                        name='billingVat'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder='VAT number' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Billing Country */}
                      <FormField
                        control={form.control}
                        name='billingCountry'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country/region</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select a country' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.value}
                                    value={country.value}
                                  >
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Billing Address */}
                      <FormField
                        control={form.control}
                        name='billingAddress'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder='Street address' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Billing City */}
                        <FormField
                          control={form.control}
                          name='billingCity'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder='City' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Billing State */}
                        <FormField
                          control={form.control}
                          name='billingState'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='State/Province/Region'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Billing Postal Code */}
                      <FormField
                        control={form.control}
                        name='billingPostalCode'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal / ZIP code</FormLabel>
                            <FormControl>
                              <Input placeholder='Enter code' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Billing Phone */}
                      <FormField
                        control={form.control}
                        name='billingPhone'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone number</FormLabel>
                            <FormControl>
                              <Input placeholder='Phone number' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Note */}
                  <FormField
                    control={form.control}
                    name='note'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Special instructions for delivery or other notes'
                            className='resize-none'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className='flex justify-end'>
                  <Button type='button' onClick={nextTab}>
                    Continue to Review
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value='review'>
              <Card className='py-6'>
                <CardHeader>
                  <CardTitle>Review your order</CardTitle>
                  <CardDescription>
                    Please review your order details before proceeding to
                    payment.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Order Summary */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Order Summary</h3>

                    {cart && cart.items.length > 0 ? (
                      <div className='space-y-4'>
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className='flex justify-between items-center border-b pb-2'
                          >
                            <div className='flex items-center space-x-4 '>
                              {item.image && (
                                <div className=' relative h-18 w-18 rounded overflow-hidden'>
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className='h-full w-full object-cover'
                                  />
                                </div>
                              )}
                              <div>
                                <p className='font-medium'>{item.name}</p>
                                <p className='text-sm text-gray-500'>
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className='font-medium'>
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}

                        <div className='flex justify-between pt-2'>
                          <p className='font-medium'>Total</p>
                          <p className='font-bold'>${cart.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : (
                      <p>Your cart is empty</p>
                    )}
                  </div>

                  <Separator />

                  {/* Delivery Information Summary */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>
                      Delivery Information
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <h4 className='font-medium'>Contact</h4>
                        <p>
                          {form.getValues('firstName')}{' '}
                          {form.getValues('lastName')}
                        </p>
                        <p>{form.getValues('email')}</p>
                        <p>{form.getValues('phone')}</p>
                      </div>

                      {form.getValues('deliveryType') === 'delivery' && (
                        <div>
                          <h4 className='font-medium'>Shipping Address</h4>
                          <p>{form.getValues('address')}</p>
                          <p>
                            {form.getValues('city')},
                            {form.getValues('state') &&
                              ` ${form.getValues('state')},`}
                            {form.getValues('postalCode')}
                          </p>
                          <p>
                            {
                              countries.find(
                                (c) => c.value === form.getValues('country')
                              )?.label
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {!form.getValues('useSameForBilling') && (
                      <div>
                        <h4 className='font-medium'>Billing Address</h4>
                        <p>
                          {form.getValues('billingFirstName')}{' '}
                          {form.getValues('billingLastName')}
                        </p>
                        {form.getValues('billingCompany') && (
                          <p>{form.getValues('billingCompany')}</p>
                        )}
                        {form.getValues('billingVat') && (
                          <p>VAT: {form.getValues('billingVat')}</p>
                        )}
                        <p>{form.getValues('billingAddress')}</p>
                        <p>
                          {form.getValues('billingCity')},
                          {form.getValues('billingState') &&
                            ` ${form.getValues('billingState')},`}
                          {form.getValues('billingPostalCode')}
                        </p>
                        <p>
                          {
                            countries.find(
                              (c) =>
                                c.value === form.getValues('billingCountry')
                            )?.label
                          }
                        </p>
                      </div>
                    )}

                    {form.getValues('note') && (
                      <div>
                        <h4 className='font-medium'>Order Notes</h4>
                        <p>{form.getValues('note')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                  <Button type='button' variant='outline' onClick={prevTab}>
                    Back
                  </Button>
                  <Button type='button' onClick={nextTab}>
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value='payment'>
              <Card className='py-6'>
                <CardHeader>
                  <CardTitle>Make payment</CardTitle>
                  <CardDescription>
                    Complete your purchase by making a payment.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Payment Method Selection */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Payment Method</h3>

                    {/* This is a placeholder for payment methods */}
                    {/* In a real application, you would integrate with a payment provider */}
                    <RadioGroup defaultValue='card' className='space-y-3'>
                      <div className='flex items-center space-x-2 border p-4 rounded-md'>
                        <RadioGroupItem value='card' id='card' />
                        <label htmlFor='card' className='flex-1'>
                          Credit/Debit Card
                        </label>
                      </div>
                      <div className='flex items-center space-x-2 border p-4 rounded-md'>
                        <RadioGroupItem value='paypal' id='paypal' />
                        <label htmlFor='paypal' className='flex-1'>
                          PayPal
                        </label>
                      </div>
                      <div className='flex items-center space-x-2 border p-4 rounded-md'>
                        <RadioGroupItem value='bank' id='bank' />
                        <label htmlFor='bank' className='flex-1'>
                          Bank Transfer
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Order Total */}
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <p>Subtotal</p>
                      <p>${cart?.total.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className='flex justify-between'>
                      <p>Shipping</p>
                      <p>Free</p>
                    </div>
                    <div className='flex justify-between font-bold text-lg'>
                      <p>Total</p>
                      <p>${cart?.total.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                  <Button type='button' variant='outline' onClick={prevTab}>
                    Back
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
