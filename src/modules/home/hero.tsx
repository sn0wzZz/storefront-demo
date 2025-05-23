import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';


export default function Hero() {
  return (
    <div className='h-[720px] w-full relative'>
      <div className='h-full w-full bg-gradient-to-b from-black/30 to-black/10 absolute inset-0 z-20 flex-center '>
        <div className='max-w-[607px] text-white flex-center flex-col'>
          <h1 className='display-main'>Ексклузивен клуб</h1>
          <p className='max-w-[460px] text-center mt-2 tex-18 font-normal'>
            Ексклузивен клуб за селекция от подбрани продукти с най-високо
            качество и най-актуални тенденции в модата.
          </p>
          <Button variant={'secondary'} className='mt-6'>
            <span>Влез в клуба</span>
            <ArrowUpRight />
          </Button>
        </div>
      </div>
      <Image src='/home/hero.jpg' fill className='object-cover ' alt='Hero' />
    </div>
  )
}