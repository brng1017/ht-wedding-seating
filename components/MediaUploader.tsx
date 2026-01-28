'use client';

import { useState } from 'react';

export default function MediaUploader({
  onUploaded,
}: {
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setBusy(true);
    setMsg(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption', caption);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();

    if (!res.ok) {
      setMsg(json.error || 'Upload failed');
    } else {
      setFile(null);
      setCaption('');
      setMsg(json.approved ? 'Uploaded!' : 'Uploaded — pending approval ❤️');
      onUploaded();
    }
    setBusy(false);
  }

  return (
    <div className='rounded-2xl border p-4'>
      <div className='text-lg font-semibold'>Share Photos & Videos</div>
      <p className='text-sm opacity-80 mt-1'>Keep it wedding-friendly 😄</p>

      <input
        className='mt-3 w-full'
        type='file'
        accept='image/*,video/*'
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <input
        className='mt-3 w-full rounded-xl border px-3 py-2'
        placeholder='Caption (optional)'
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={140}
      />

      <button
        className='mt-3 w-full rounded-xl border px-4 py-3 font-semibold disabled:opacity-50'
        disabled={!file || busy}
        onClick={submit}
      >
        {busy ? 'Uploading…' : 'Upload'}
      </button>

      {msg && <div className='mt-3 text-sm opacity-80'>{msg}</div>}
    </div>
  );
}
