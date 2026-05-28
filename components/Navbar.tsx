'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdOutlineTableBar, MdOutlineCameraAlt } from 'react-icons/md';
import { LiaTabletsSolid } from 'react-icons/lia';

export default function Navbar() {
  const pathname = usePathname();
  const getNavLinkClassName = (href: string) =>
    `py-3.5 px-2 pb-3 flex flex-col items-center gap-1.5 flex-1 relative transition-colors duration-200
      [&.active]:text-taupe
      before:absolute before:top-0 before:left-[20%] before:right-[20%] before:h-px before:bg-transparent
      [&.active]:before:bg-[#a08060]${pathname === href ? ' active' : ''}`;

  return (
    <nav className='w-full flex flex-row justify-around items-stretch z-20 border-t border-taupe/25 bg-ivory backdrop-blur-md text-taupe/65 text-[10px] font-light tracking-[0.18em] uppercase text-center'>
      <Link className={getNavLinkClassName('/')} href='/'>
        <MdOutlineTableBar size={20} />
        <p>Find Your Seat</p>
      </Link>

      <div className='w-px bg-taupe/18 my-3.5' />

      <Link className={getNavLinkClassName('/seating')} href='/seating'>
        <LiaTabletsSolid size={20} />
        <p>Floor Plan</p>
      </Link>

      <div className='w-px bg-taupe/18 my-3.5' />

      <Link className={getNavLinkClassName('/media')} href='/media'>
        <MdOutlineCameraAlt size={20} />
        <p>Photo Share</p>
      </Link>
    </nav>
  );
}
