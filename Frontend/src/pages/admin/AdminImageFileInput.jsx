import React, { useCallback, useEffect, useState } from 'react';

const compressImageDataUrl = (dataUrl, maxSide = 1600, quality = 0.82) =>
  new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const longest = Math.max(img.width, img.height);
        const scale = longest > maxSide ? maxSide / longest : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const jpeg = canvas.toDataURL('image/jpeg', quality);
        resolve(jpeg && jpeg.length < dataUrl.length ? jpeg : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

/**
 * Rounded “Choose file / No file chosen” style control; reads image as base64 for API `image` fields.
 */
const AdminImageFileInput = ({
  id,
  label,
  value,
  onChange,
  resetKey = 0,
  maxPickMb = 8,
  helperText
}) => {
  const [localError, setLocalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLocalError('');
    setIsProcessing(false);
  }, [resetKey]);

  const handlePick = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      setLocalError('');
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setLocalError('Please choose an image file.');
        return;
      }
      if (file.size > maxPickMb * 1024 * 1024) {
        setLocalError(`Image must be under ${maxPickMb} MB.`);
        return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const raw = reader.result;
          const compressed = await compressImageDataUrl(typeof raw === 'string' ? raw : '');
          onChange(compressed);
        } catch {
          setLocalError('Could not read this image.');
          onChange('');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setLocalError('Could not read file.');
        onChange('');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    },
    [maxPickMb, onChange]
  );

  const clear = () => {
    onChange('');
    setLocalError('');
    setIsProcessing(false);
  };

  const statusSlot = () => {
    if (isProcessing) {
      return <span className="text-xs font-semibold text-amber-700">processing...</span>;
    }
    if (value) {
      return <span className="text-sm font-bold text-emerald-700">chosen file</span>;
    }
    return <span className="text-sm font-bold text-red-600">no chosen file</span>;
  };

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div
        className={`mt-1 rounded-2xl border bg-white shadow-sm overflow-hidden flex min-h-[48px] ${
          localError ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'
        }`}
      >
        <input
          key={resetKey}
          id={id}
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className="shrink-0 inline-flex items-center justify-center px-4 min-h-[48px] border-r border-gray-200 bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 cursor-pointer"
        >
          Choose File
        </label>
        <div className="flex-1 min-w-0" />
        <div className="shrink-0 flex items-center justify-center px-4 min-w-[7.5rem] border-l border-gray-200 bg-gray-50/90">
          {statusSlot()}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500 truncate flex-1 min-w-0">{value && !isProcessing ? 'Image ready — you can submit the form.' : 'Choose an image file to continue.'}</p>
        {value ? (
          <button type="button" className="text-xs font-semibold text-red-600 hover:text-red-800 shrink-0" onClick={clear}>
            Remove image
          </button>
        ) : null}
      </div>
      {localError ? <p className="text-xs text-red-600 mt-1">{localError}</p> : null}
      {helperText ? <p className="text-xs text-gray-500 mt-1">{helperText}</p> : null}
    </div>
  );
};

export default AdminImageFileInput;
