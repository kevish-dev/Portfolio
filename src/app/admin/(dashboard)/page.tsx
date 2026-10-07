import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { isSupabaseConfigured, rpc } from '@/lib/supabase'

type Row = { label: string; count: number }
type Summary = {
  views: number
  visitors: number
  all_time_views: number
  all_time_visits: number
  by_day: { day: string; views: number; visitors: number }[]
  pages: Row[]
  countries: Row[]
  cities: Row[]
  referrers: Row[]
  devices: Row[]
  browsers: Row[]
}

const RANGES = [7, 30, 90]
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countryName = (code: string) => {
  try {
    return code.length === 2 ? `${regionNames.of(code)} (${code})` : code
  } catch {
    return code
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString('en-IN')}</p>
    </div>
  )
}

function Table({ title, rows, format = (s: string) => s }: { title: string; rows: Row[]; format?: (s: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm border">
      <h2 className="font-semibold mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-600">No data yet.</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="py-1 pr-2 relative">
                  <span className="absolute inset-y-1 left-0 rounded bg-[#c5f467]/40" style={{ width: `${(r.count / max) * 100}%` }} />
                  <span className="relative px-1 break-all">{format(r.label)}</span>
                </td>
                <td className="py-1 text-right tabular-nums w-16">{r.count.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default async function AnalyticsPage({ searchParams }: { searchParams: { range?: string } }) {
  await requireAdmin()
  const range = RANGES.includes(Number(searchParams.range)) ? Number(searchParams.range) : 30

  let data: Summary | null = null
  let error = ''
  if (isSupabaseConfigured()) {
    try {
      data = await rpc<Summary>('analytics_summary', { range_days: range })
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load analytics'
    }
  }

  const maxDay = Math.max(1, ...(data?.by_day.map((d) => d.views) ?? [1]))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              aria-current={r === range ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-md border text-sm ${r === range ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              Last {r} days
            </Link>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label={`Page views (${range} days)`} value={data.views} />
            <Stat label={`Visitors (${range} days)`} value={data.visitors} />
            <Stat label="Page views (all time)" value={data.all_time_views} />
            <Stat label="Visits (all time, shown publicly)" value={data.all_time_visits} />
          </div>

          <section className="rounded-xl bg-white p-5 shadow-sm border">
            <h2 className="font-semibold mb-4">Page views per day</h2>
            <div className="flex items-end gap-[2px] h-40" aria-hidden="true">
              {data.by_day.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                  className="flex-1 bg-black/80 hover:bg-blue-600 rounded-t"
                  style={{ height: `${Math.max(2, (d.views / maxDay) * 100)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>{data.by_day[0]?.day}</span>
              <span>{data.by_day[data.by_day.length - 1]?.day}</span>
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-gray-700">Show as table</summary>
              <table className="mt-2 w-full">
                <thead><tr className="text-left"><th>Day</th><th className="text-right">Views</th><th className="text-right">Visitors</th></tr></thead>
                <tbody>
                  {data.by_day.map((d) => (
                    <tr key={d.day}><td>{d.day}</td><td className="text-right">{d.views}</td><td className="text-right">{d.visitors}</td></tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            <Table title="Top pages" rows={data.pages} />
            <Table title="Countries" rows={data.countries} format={countryName} />
            <Table title="Cities" rows={data.cities} />
            <Table title="Referrers" rows={data.referrers} />
            <Table title="Devices" rows={data.devices} />
            <Table title="Browsers" rows={data.browsers} />
          </div>
          <p className="text-xs text-gray-600">
            Location comes from Vercel&apos;s IP geolocation headers, so it is only recorded on the deployed site.
            Your own visits are not counted while you are signed in.
          </p>
        </>
      )}
    </div>
  )
}
