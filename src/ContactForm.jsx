import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { getSource, getVisitorId } from './lib/visitor';

const EMPTY_FORM = {
  name: '',
  company: '',
  role: '',
  email: '',
  phone: '',
  message: '',
  website: '',
};

const inputClassName = 'w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

const ContactForm = () => {
  const { t, language } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status !== 'submitting') setStatus('idle');
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          visitor: {
            id: getVisitorId(),
            source: getSource(),
            language,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Lead submission failed');

      setForm(EMPTY_FORM);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const statusMessage = status === 'success'
    ? t.contact.success
    : status === 'error'
      ? (form.email.trim() || form.phone.trim() ? t.contact.error : t.contact.contactRequired)
      : '';

  return (
    <form onSubmit={submitForm} className="space-y-4 text-left" aria-label={t.contact.title}>
      <h3 className="text-xl font-black text-white">{t.contact.title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1.5 text-xs font-bold text-slate-300">
          <span>{t.contact.name} *</span>
          <input className={inputClassName} name="name" value={form.name} onChange={updateField} maxLength={120} autoComplete="name" required />
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-300">
          <span>{t.contact.company}</span>
          <input className={inputClassName} name="company" value={form.company} onChange={updateField} maxLength={160} autoComplete="organization" />
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-300">
          <span>{t.contact.role}</span>
          <input className={inputClassName} name="role" value={form.role} onChange={updateField} maxLength={160} autoComplete="organization-title" />
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-300">
          <span>{t.contact.email}</span>
          <input className={inputClassName} name="email" type="email" value={form.email} onChange={updateField} maxLength={254} autoComplete="email" />
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
          <span>{t.contact.phone}</span>
          <input className={inputClassName} name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={40} autoComplete="tel" />
        </label>
        <label className="space-y-1.5 text-xs font-bold text-slate-300 sm:col-span-2">
          <span>{t.contact.message}</span>
          <textarea className={`${inputClassName} min-h-24 resize-y`} name="message" value={form.message} onChange={updateField} maxLength={5000} rows={3} />
        </label>
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-1 text-xs leading-relaxed text-slate-400">
        <p>{t.contact.consentNote}</p>
        <p>{t.contact.privacyNote}</p>
      </div>

      {statusMessage && (
        <p role={status === 'error' ? 'alert' : 'status'} className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
          {statusMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
      >
        {status === 'submitting' ? t.contact.submitting : t.contact.submit}
      </button>
    </form>
  );
};

export default ContactForm;
