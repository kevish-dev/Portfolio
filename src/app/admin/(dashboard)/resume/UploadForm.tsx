'use client'

import { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { uploadResume, type FormResult } from '../../actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="self-start bg-black text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-60">
      {pending ? 'Uploading…' : 'Upload and publish'}
    </button>
  )
}

export default function UploadForm() {
  const [state, action] = useFormState<FormResult, FormData>(uploadResume, {})
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) ref.current?.reset()
  }, [state])

  return (
    <form ref={ref} action={action} className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm border">
      <label htmlFor="file" className="font-medium">New resume (PDF, up to 4 MB)</label>
      <input id="file" name="file" type="file" accept="application/pdf" required className="text-sm" />
      <Submit />
      <p role="status" className={state.error ? 'text-red-700' : 'text-green-700'}>{state.error ?? state.ok}</p>
    </form>
  )
}
