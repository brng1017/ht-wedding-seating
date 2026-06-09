import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  getUploadAccessFromCookieValue,
  UPLOAD_ACCESS_COOKIE_NAME,
} from '@/lib/upload-access';
import cornerflowers from '../../public/cornerflowers.png';
import Image from 'next/image';

const afterPartyDetails = {
  title: 'After Party',
  hostLine: 'Keep the night going with us after the reception.',
  locationName: 'Late Night Lounge',
  locationAddress: 'Venue details coming soon',
  startTime: 'Right after the reception',
};

export default async function AfterPartyPage() {
  const cookieStore = await cookies();
  const access = getUploadAccessFromCookieValue(
    cookieStore.get(UPLOAD_ACCESS_COOKIE_NAME)?.value,
  );

  if (!access) {
    notFound();
  }

  return (
    <div className='mx-auto flex h-full w-full max-w-lg flex-col items-center px-5 pt-12 text-center'>
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

      <p className='text-xs uppercase tracking-[0.35em] text-taupe/70'>
        Hidden Details
      </p>
      <h1 className='mt-3 text-6xl font-cursive'>{afterPartyDetails.title}</h1>
      <p className='mt-4 max-w-sm text-sm uppercase opacity-75'>
        {afterPartyDetails.hostLine}
      </p>

      <div className='mt-8 w-full rounded-4xl border border-taupe/20 bg-ivory/80 px-6 py-7 shadow-sm backdrop-blur-sm'>
        <p className='text-xs uppercase tracking-[0.28em] text-taupe/60'>
          Location
        </p>
        <h2 className='mt-3 text-2xl uppercase text-taupe'>
          {afterPartyDetails.locationName}
        </h2>
        <p className='mt-2 text-sm uppercase opacity-70'>
          {afterPartyDetails.locationAddress}
        </p>

        <div className='mx-auto mt-6 h-px w-16 bg-taupe/20' />

        <p className='mt-6 text-xs uppercase tracking-[0.28em] text-taupe/60'>
          Timing
        </p>
        <p className='mt-3 text-lg uppercase text-taupe'>
          {afterPartyDetails.startTime}
        </p>
      </div>
    </div>
  );
}
