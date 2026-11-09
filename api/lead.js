import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from './_lib/supabase.js';
import { isUuid, upsertVisitor } from './_lib/visitorData.js';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const submissionsByIpHash = new Map();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

function readField(body, name, maxLength, required = false) {
  const raw = body[name];
  if (raw == null && !required) return { value: null };
  if (typeof raw !== 'string') return { error: `${name} must be text.` };

  const value = raw.trim();
  if (required && !value) return { error: `${name} is required.` };
  if (value.length > maxLength) return { error: `${name} must be ${maxLength} characters or fewer.` };
  return { value: value || null };
}

function getRateLimitKey(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

function isRateLimited(key, now = Date.now()) {
  for (const [storedKey, timestamps] of submissionsByIpHash) {
    const active = timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (active.length) submissionsByIpHash.set(storedKey, active);
    else submissionsByIpHash.delete(storedKey);
  }

  const timestamps = submissionsByIpHash.get(key) || [];
  if (timestamps.length >= RATE_LIMIT) return true;

  timestamps.push(now);
  submissionsByIpHash.set(key, timestamps);
  return false;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'A JSON object is required.' }, 400);
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return json({ ok: true }, 201);
  }

  const name = readField(body, 'name', 120, true);
  const company = readField(body, 'company', 160);
  const role = readField(body, 'role', 160);
  const email = readField(body, 'email', 254);
  const phone = readField(body, 'phone', 40);
  const message = readField(body, 'message', 5000);
  const invalidField = [name, company, role, email, phone, message].find((field) => field.error);
  if (invalidField) return json({ error: invalidField.error }, 400);

  if (!email.value && !phone.value) {
    return json({ error: 'Email or phone is required.' }, 400);
  }
  if (email.value && !EMAIL_PATTERN.test(email.value)) {
    return json({ error: 'Enter a valid email address.' }, 400);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return json({ error: 'Lead storage is not configured on the server.' }, 503);
  if (isRateLimited(getRateLimitKey(request))) {
    return json({ error: 'Too many submissions. Please try again in 10 minutes.' }, 429);
  }

  const visitor = body.visitor && typeof body.visitor === 'object' ? body.visitor : {};
  const visitorId = isUuid(visitor.id) ? visitor.id : null;

  try {
    if (visitorId) {
      await upsertVisitor(supabase, visitor, {
        name: name.value,
        company: company.value,
        role: role.value,
      });
    }

    const { error } = await supabase.from('leads').insert({
      visitor_id: visitorId,
      name: name.value,
      company: company.value,
      role: role.value,
      email: email.value,
      phone: phone.value,
      message: message.value,
    });

    if (error) throw error;
    return json({ ok: true }, 201);
  } catch (error) {
    console.error('Lead storage failed:', {
      code: error?.code || 'unknown',
      message: error?.message || 'Unknown Supabase error',
    });
    return json({ error: 'Unable to save your message right now. Please try again later.' }, 500);
  }
}
