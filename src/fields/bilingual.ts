import type { Field } from 'payload'

/**
 * Generates a `{ ko, en }` group field for content that is displayed
 * bilingually (Korean + English) side-by-side on the site, rather than
 * switched via Payload locales.
 */
export const bilingualText = (
  name: string,
  opts?: { label?: string; required?: boolean; koLabel?: string; enLabel?: string },
): Field => ({
  name,
  type: 'group',
  label: opts?.label ?? name,
  fields: [
    {
      name: 'ko',
      type: 'text',
      label: opts?.koLabel ?? '한국어 (Korean)',
      required: opts?.required ?? true,
    },
    {
      name: 'en',
      type: 'text',
      label: opts?.enLabel ?? 'English',
      required: opts?.required ?? true,
    },
  ],
})
