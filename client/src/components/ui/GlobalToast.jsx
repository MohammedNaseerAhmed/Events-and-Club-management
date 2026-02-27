import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle } from 'lucide-react';

export default function GlobalToast() {
  const { toast, dismissToast } = useToast();
  const { message, type } = toast;

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(dismissToast, 4000);
    return () => clearTimeout(t);
  }, [message, dismissToast]);

  if (!message) return null;

  const isSuccess = type === 'success';
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg border"
      style={{
        backgroundColor: isSuccess ? 'rgb(5 150 105)' : 'rgb(185 28 28)',
        color: 'white',
        borderColor: isSuccess ? 'rgb(4 120 87)' : 'rgb(153 27 27)',
      }}
      role="alert"
      aria-live="polite"
    >
      {isSuccess ? <CheckCircle size={20} className="flex-shrink-0" /> : <XCircle size={20} className="flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
