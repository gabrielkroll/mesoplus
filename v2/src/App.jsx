import useStore from './store/useStore'
import LogPage from './components/log/LogPage'

function App() {
  const activeTab = useStore(s => s.activeTab)

  return (
    <main>
      {activeTab === 'log' && <LogPage />}
      {/* Other tabs added as they're built */}
    </main>
  )
}

export default App
