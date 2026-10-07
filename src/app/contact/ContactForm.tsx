'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { sendMessage, type ContactState } from './actions'

const initial: ContactState = { status: 'idle', message: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start bg-[#c5f467] text-black py-3 px-8 rounded-full font-semibold transition-all duration-300 hover:bg-[#b5e457] disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send message'}
    </button>
  )
}

const field = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30'

export default function ContactForm() {
  const [state, action] = useFormState(sendMessage, initial)
  const [startedAt, setStartedAt] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => setStartedAt(Date.now()), [])
  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Honeypot: hidden from people and screen readers, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-medium">Name</label>
        <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" className={field} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-medium">Email</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="font-medium">Message</label>
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} className={field} />
      </div>

      <SubmitButton />

      <p
        role="status"
        aria-live="polite"
        className={state.status === 'error' ? 'text-red-700' : 'text-green-700'}
      >
        {state.message}
      </p>
    </form>
  )
}
