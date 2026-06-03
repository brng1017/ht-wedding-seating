import SeatingSearch from '@/components/SeatingSearch';
import cornerflowers from '../public/cornerflowers.png';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className='h-full flex flex-col items-center pt-16 overflow-hidden'>
      <Image
        src={cornerflowers}
        alt='upload'
        className='absolute top-0 left-0 h-52 w-auto opacity-70 pointer-events-none object-contain'
      />
      <Image
        src={cornerflowers}
        alt='upload'
        className='absolute bottom-0 right-0 h-52 w-auto opacity-70 pointer-events-none object-contain rotate-180'
      />
      <div className='relative mb-4'>
        <h1 className='text-8xl font-cursive-secondary'>
          Huy<br></br>Teresa
        </h1>
        <h1 className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[14rem] leading-none text-black/25 font-cursive'>
          &
        </h1>
      </div>
      <h3 className='font-cursive text-3xl'>6.27.2026</h3>
      <p className='mt-2 max-w-64 opacity-80 uppercase text-center text-xs'>
        Find your table and share your favorite moments.
      </p>
      <SeatingSearch />
    </div>
  );
}
