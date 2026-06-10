import type { Field } from 'payload'

import { FixedToolbarFeature, TableFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

/**
 * Shared rich-text editor config: Payload's default Lexical feature set
 * (headings, lists, links, blockquotes, bold/italic/etc.) plus a fixed
 * toolbar that's always visible — closer to a "decent" CMS editor than the
 * bare default, which only shows formatting controls on text selection.
 *
 * The default feature set already includes `UploadFeature`, which is what
 * gives editors drag-and-drop (and paste / "Add Upload") image embedding —
 * dropped images are uploaded straight into the Media collection and
 * inserted inline, the same way GitLab's MR description box works.
 */
const richTextEditor = () =>
  lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature(), TableFeature()],
  })

/**
 * Generates a `{ ko, en }` group of long-form rich-text fields for content
 * that is displayed bilingually (Korean + English), mirroring the pattern
 * used by `bilingualText()` for short copy. Each side gets its own full
 * editor — including drag-and-drop image upload — so editors can write and
 * illustrate the Korean and English versions independently.
 */
export const bilingualRichText = (
  name: string,
  opts?: { label?: string; required?: boolean; koLabel?: string; enLabel?: string },
): Field => ({
  name,
  type: 'group',
  label: opts?.label ?? name,
  fields: [
    {
      name: 'ko',
      type: 'richText',
      label: opts?.koLabel ?? '한국어 (Korean)',
      required: opts?.required ?? false,
      editor: richTextEditor(),
    },
    {
      name: 'en',
      type: 'richText',
      label: opts?.enLabel ?? 'English',
      required: opts?.required ?? false,
      editor: richTextEditor(),
    },
  ],
})
