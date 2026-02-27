import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Simple success toast. Auto-dismisses after 4s.
 * @param {{ message: string | null, onDismiss: () => void }} props
 */
export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-3 shadow-lg"
      role="alert"
    >
      <CheckCircle size={20} className="flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
