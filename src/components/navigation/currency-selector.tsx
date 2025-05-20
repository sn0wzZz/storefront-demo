'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CoreCurrency } from '@/types/store'

interface CurrencySelectorProps {
  currencies: CoreCurrency[] | undefined
  defaultCurrency?: string
  onCurrencyChange?: (currency: string) => void
}

export function CurrencySelector({
  currencies,
  defaultCurrency = 'EUR',
  onCurrencyChange,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Set initial currency from URL or default
  useEffect(() => {
    const currencyParam = searchParams.get('currency')
    if (currencyParam && currencies?.some((c) => c.code === currencyParam)) {
      setSelectedCurrency(currencyParam)
    }
  }, [searchParams, currencies])

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
    setOpen(false)

    // Update URL with selected currency
    const params = new URLSearchParams(searchParams.toString())
    params.set('currency', currencyCode)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })

    // Call the callback if provided
    if (onCurrencyChange) {
      onCurrencyChange(currencyCode)
    }
  }

  // Find the selected currency object
  const currentCurrency =
    currencies?.find((c) => c.code === selectedCurrency) || currencies?.[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[120px] justify-between'
        >
          {currentCurrency ? (
            <span className='flex items-center gap-2'>
              {currentCurrency.code}
              {currentCurrency.code=='EUR' && <span>€</span>}
              {currentCurrency.code=='BGN' && <span>лв.</span>}
            </span>
          ) : (
            'Select...'
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search currency...' />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup>
            {currencies?.map((currency) => (
              <CommandItem
                key={currency.id}
                value={currency.code}
                onSelect={() => handleCurrencySelect(currency.code)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedCurrency === currency.code
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
                <span className='flex items-center gap-2'>
                  {currency.code}
                  <span className='text-muted-foreground text-sm'>
                    {currency.code=='EUR' && <span>€</span>}
                    {currency.code=='BGN' && <span>лв.</span>}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
