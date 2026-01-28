import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='mx-auto max-w-xl p-4'>
      <h1 className='text-3xl font-bold'>Welcome ❤️</h1>
      <p className='mt-2 opacity-80'>
        Find your table and share your favorite moments.
      </p>

      <div className='mt-6 grid gap-3'>
        <Link className='rounded-2xl border p-5' href='/seating'>
          <div className='text-xl font-semibold'>Find My Table</div>
          <div className='mt-1 text-sm opacity-80'>
            Search by name → table number
          </div>
        </Link>

        <Link className='rounded-2xl border p-5' href='/media'>
          <div className='text-xl font-semibold'>Photo & Video Wall</div>
          <div className='mt-1 text-sm opacity-80'>
            Upload + view everyone's posts
          </div>
        </Link>
      </div>
    </div>
  );
}
