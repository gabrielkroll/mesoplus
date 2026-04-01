import useStore from './store/useStore'
import BottomNav from './components/layout/BottomNav'
import LogPage from './components/log/LogPage'

function App() {
  const activeTab = useStore(s => s.activeTab)

  return (
    <>
      {activeTab === 'log'      && <LogPage />}
      {activeTab === 'stats'    && <Placeholder label="Stats" />}
      {activeTab === 'analysis' && <Placeholder label="Analysis" />}
      {activeTab === 'plan'     && <Placeholder label="Plan" />}
      {activeTab === 'profile'  && <Placeholder label="Profile" />}
      <BottomNav />
    </>
  )
}

function Placeholder({ label }) {
  return (
    <div style={{ padding: '40px 16px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', color: 'var(--color-ink)' }}>
      {label}
    </div>
  )
}

export default App
