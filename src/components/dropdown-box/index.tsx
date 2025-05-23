'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  toggleOpen: () => void
}

const AccordionItem = ({
  title,
  children,
  isOpen,
  toggleOpen,
}: AccordionItemProps) => {
  return (
    <div className='border border-gray-200'>
      <button
        className='flex w-full justify-between items-center h-20 px-5 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors'
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <div className='w-10  h-full flex-center'>
        <div className='p-2.5 border'>

        {isOpen?<Minus
          className='h-5 w-5  '
          />:
        <Plus
          className='h-5 w-5  '
          />}
          </div>
          </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] py-4 border-t' : 'max-h-0'
        }`}
      >
        <div className='px-4 prose prose-sm max-w-none'>{children}</div>
      </div>
    </div>
  )
}

export default function ProductAccordion() {
  const [openSection, setOpenSection] = useState<string | null>('about')

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <div className='w-full  border-gray-200 rounded-md divide-y divide-gray-200 mt-8 space-y-6'>
      <AccordionItem
        title='За продукта'
        isOpen={openSection === 'about'}
        toggleOpen={() => toggleSection('about')}
      >
        <p>
          The Arman Classic Varsity Jacket is a fusion of retro style and modern
          craftsmanship, designed to meet both fashion and function. Made from a
          premium wool blend, the body of the jacket offers excellent warmth,
          perfect for layering during cooler days. The sleeves are constructed
          from high-grade faux leather, giving a sleek, polished look while also
          being water-resistant. The jacket is fully lined with a soft polyester
          interior, providing added comfort and breathability, making it ideal
          for all-day wear.
        </p>
        <p>
          Every detail of this varsity jacket is thoughtfully designed for
          durability and style. The ribbed cuffs, are finely stitched for a snug
          fit, while reinforced seams ensure long-lasting wear even in everyday
          use. Whether you're looking for a classic street style piece or a
          versatile casual jacket.
        </p>
      </AccordionItem>

      <AccordionItem
        title='Доставка и замяна'
        isOpen={openSection === 'shipping'}
        toggleOpen={() => toggleSection('shipping')}
      >
        <h3 className='text-lg font-medium'>SHIPPING</h3>
        <p>
          Продуктите се изпращат с преглед и тест. На място може да прецените
          дали продукта съответства на очакванията ви. Връщането е за сметка на
          купувача.
        </p>
        <p>
          For Pre-order and Made to Order items, we will ship these on the
          estimated date provided on the product description page. Once ready,
          these items will be shipped via Premium Express, ensuring prompt
          delivery to your doorstep.
        </p>

        <h3 className='text-lg font-medium mt-4'>RETURNS</h3>
        <p>
          To provide more flexibility during the holiday season, we offer
          extended returns. Orders placed from November 1 to January 1 will
          benefit from complimentary returns until January 31.
        </p>
        <p>
          You can return items via mail or in-store. To process a return, log
          into your MY Store account and select "Return this Item" from the
          order details, or use the link in your delivery confirmation email.
          You may also contact Customer Support for help. Once the request is
          approved, a prepaid shipping label will be emailed to you or made
          available for download in your MY Store account.
        </p>
        <p>
          For Collect-In-Store orders, we offer a 30-day return/exchange window,
          either in-store or by contacting Customer Support. The return window
          begins from the day your item is made available for collection.
        </p>
        <p>
          All returned items must be in their original condition, with all
          labels attached and intact. Please note that Made to Order and
          personalized items are non-returnable.
        </p>
        <p>
          Additional information is available during the checkout process or in
          the FAQs section.
        </p>
   
        <div className='overflow-x-auto mt-10 border'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead>
              <tr>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Цена за доставка
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Време за доставка
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              <tr>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Premium Express (Continental U.S.)
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>Free</td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  2-3 business days.
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Premium Express (Alaska, Hawaii, Puerto Rico)
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>$10</td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  4-5 business days.
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Premium Express International (Europe & Asia)
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>$25</td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  7-10 business days.
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Premium Express International (Other Regions)
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>$35</td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  10-14 business days.
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Next Business Day (U.S.)
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>$30</td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Order by 4 pm EST for next-day delivery between 9 am - 8 pm.
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 whitespace-nowrap'>
                  Collect In-Store
                </td>
                <td className='px-4 py-2 whitespace-nowrap'>Free</td>
                <td className='px-4 py-2 whitespace-nowrap'>
                  1-2 business days, period 14 days
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AccordionItem>
    </div>
  )
}
