'use client';

import { useRef, useState } from 'react';

export default function MediaUploader({
  onUploaded,
}: {
  onUploaded: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function uploadFile(file: File) {
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        return {
          ok: false,
          message: json.error || 'Upload failed',
        };
      } else {
        return {
          ok: true,
          message: json.approved ? 'Uploaded!' : 'Upload pending approval',
        };
      }
    } catch {
      return {
        ok: false,
        message: 'Upload failed',
      };
    }
  }

  async function uploadFiles(files: File[]) {
    setBusy(true);
    setMsg(null);

    let successCount = 0;
    let failureCount = 0;
    let lastFailureMessage: string | null = null;

    try {
      for (const [index, file] of files.entries()) {
        setMsg(
          files.length === 1
            ? `Uploading ${file.name}...`
            : `Uploading ${index + 1} of ${files.length}...`,
        );

        const result = await uploadFile(file);
        if (result.ok) {
          successCount += 1;
        } else {
          failureCount += 1;
          lastFailureMessage = result.message;
        }
      }

      if (successCount > 0) {
        onUploaded();
      }

      if (failureCount === 0) {
        setMsg(
          successCount === 1
            ? 'Uploaded!'
            : `${successCount} uploads complete!`,
        );
        return;
      }

      if (successCount === 0) {
        setMsg(lastFailureMessage || 'Upload failed');
        return;
      }

      setMsg(
        `${successCount} uploaded, ${failureCount} failed${
          lastFailureMessage ? `: ${lastFailureMessage}` : ''
        }`,
      );
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*,video/*'
        multiple
        className='hidden'
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) {
            void uploadFiles(files);
          }
        }}
      />

      <button
        type='button'
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        className='
          absolute bottom-2 left-0 w-full
          border border-taupe/40
          bg-ivory opacity-95 transition-colors
          py-2 z-20
          text-lg font-light uppercase text-taupe
          shadow-lg backdrop-blur
          disabled:opacity-50 active:scale-[0.98]
        '
      >
        {busy ? 'Uploading...' : 'Upload Photos/Videos'}
      </button>

      {msg && (
        <div className='absolute bottom-16 left-0 right-0 text-center text-sm opacity-70'>
          {msg}
        </div>
      )}
    </>
  );
}
