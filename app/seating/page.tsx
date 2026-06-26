import Image from 'next/image';
import floorplan from '../../public/htseatingchart.png';

export default function SeatingPage() {
  return (
    <div className='relative h-full w-full'>
      <Image
        src={floorplan}
        alt='floor plan'
        fill
        className='pointer-events-none object-contain'
      />
    </div>
  );
}
