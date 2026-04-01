import useStore from '../../store/useStore'

export default function LogPage() {
  const sessions = useStore(s => s.sessions)
  const today = new Date().toISOString().split('T')[0]
  const todaySession = sessions.find(s => s.date === today)

  return (
    <div style={{ padding: '20px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', marginBottom: '24px' }}>
        Meso<sup style={{ fontSize: '14px', color: 'var(--color-accent)', fontStyle: 'normal', fontFamily: 'var(--font-mono)' }}>+</sup>
      </div>

      <p style={{ color: 'var(--color-ink3)', fontSize: '11px' }}>
        V2 scaffold running ✓ · {sessions.length} sessions in mp7
        {todaySession ? ` · Today: ${todaySession.dtype}` : ' · No session today yet'}
      </p>
    </div>
  )
}
