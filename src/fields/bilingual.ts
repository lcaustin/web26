import type { Field } from 'payload'

/**
 * Generates a `{ ko, en }` group field for content that is displayed
 * bilingually (Korean + English) side-by-side on the site, rather than
 * switched via Payload locales.
 */
export const bilingualText = (
  name: string,
  opts?: { label?: string; required?: boolean; koLabel?: string; enLabel?: string; multiline?: boolean },
): Field => {
  const input = (fieldName: 'ko' | 'en', label: string): Field => (
    opts?.multiline
      ? { name: fieldName, type: 'textarea', label, required: opts?.required ?? true }
      : { name: fieldName, type: 'text', label, required: opts?.required ?? true }
  )

  return {
    name,
    type: 'group',
    label: opts?.label ?? name,
    fields: [
      input('ko', opts?.koLabel ?? '한국어 (Korean)'),
      input('en', opts?.enLabel ?? 'English'),
    ],
  }
}
