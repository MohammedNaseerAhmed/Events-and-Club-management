import React from 'react';
import { Check } from 'lucide-react';
import { passwordRules } from '../../lib/validations/authSchemas';

export default function PasswordRules({ value }) {
  const results = passwordRules.map((rule) => ({ ...rule, ok: rule.test(value) }));
  const allMet = results.every((r) => r.ok);
  if (allMet) return null;

  return (
    <ul className="mt-2 space-y-1 text-sm" role="list" aria-label="Password requirements">
      {results.map(({ id, label, ok }) => (
        <li
          key={id}
          className={`flex items-center gap-2 transition-colors ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {ok ? <Check size={14} className="flex-shrink-0" aria-hidden /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex-shrink-0" />}
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
