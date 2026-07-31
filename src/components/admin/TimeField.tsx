'use client'

import { useField } from '@payloadcms/ui'

export default function TimeField({ path, label }: { path: string; label?: string }) {
  const { value, setValue } = useField<string>({ path })
  return <div className="field-type text"><label className="field-label">{label || 'Time'}</label><input type="time" value={String(value || '')} onChange={(event) => setValue(event.target.value)} /></div>
}
