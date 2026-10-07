import { ImageResponse } from 'next/og'

export const alt = 'Kevish Sewliya - Full Stack Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#f4f5f6',
          color: '#000',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>Kevish Sewliya</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 48,
            fontWeight: 600,
            background: '#c5f467',
            padding: '8px 24px',
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          Full Stack Engineer
        </div>
        <div style={{ marginTop: 48, fontSize: 30, color: '#555' }}>kevish.dev</div>
      </div>
    ),
    size
  )
}
