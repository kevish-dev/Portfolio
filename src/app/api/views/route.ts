import { NextResponse } from 'next/server'
import { isSupabaseConfigured, rpc } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ visits: null })
  try {
    const visits = await rpc<number>('total_visits')
    return NextResponse.json(
      { visits },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ visits: null }, { status: 503 })
  }
}
