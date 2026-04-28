import React, { useEffect, useState } from 'react';

/**
 * Clickable receipt thumbnail; opens a full-screen style modal with the large image.
 */
const ReceiptLightbox = ({ src, alt = 'Payment receipt', className = '' }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative w-full overflow-hidden bg-white text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
        aria-label="View receipt full size"
      >
        <img src={src} alt={alt} className="w-full h-52 object-contain bg-white" />
        <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wide text-white bg-black/60 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          Click to enlarge
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Receipt preview"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/85 border-0 cursor-default w-full h-full"
            aria-label="Close receipt preview"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex flex-col items-center max-w-full max-h-full gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-full bg-white text-gray-900 w-10 h-10 text-2xl leading-none font-light shadow-lg hover:bg-gray-100 border border-gray-200"
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[min(88vh,1200px)] max-w-[min(96vw,1400px)] w-auto h-auto object-contain rounded-lg shadow-2xl border border-white/20 bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ReceiptLightbox;
