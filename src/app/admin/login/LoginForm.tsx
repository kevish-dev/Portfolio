'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, type FormResult } from '../actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-60">
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export default function LoginForm() {
  const [state, action] = useFormState<FormResult, FormData>(login, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="password" className="font-medium">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
      />
      <Submit />
      <p role="alert" className="text-red-700 min-h-[1.5rem]">{state.error}</p>
    </form>
  )
}
