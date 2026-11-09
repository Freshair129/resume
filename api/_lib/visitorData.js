const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function optionalText(value, maxLength) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

export async function upsertVisitor(supabase, visitor, declared = {}) {
  if (!isUuid(visitor?.id)) return;

  const { error } = await supabase.rpc('upsert_visitor', {
    p_id: visitor.id,
    p_name: optionalText(declared.name ?? visitor.name, 120),
    p_company: optionalText(declared.company ?? visitor.company, 160),
    p_role: optionalText(declared.role, 160),
    p_source: optionalText(visitor.source, 255),
    p_language: visitor.language === 'en' ? 'en' : 'th',
  });

  if (error) throw error;
}
