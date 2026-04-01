import useStore from './store/useStore'
import BottomNav from './components/layout/BottomNav'
import LogPage from './components/log/LogPage'
import StatsPage from './components/stats/StatsPage'
import AnalysisPage from './components/analysis/AnalysisPage'
import PlanPage from './components/plan/PlanPage'
import ProfilePage from './components/profile/ProfilePage'
import TransferImport from './components/transfer/TransferImport'

export default function App() {
  const activeTab = useStore(s => s.activeTab)

  return (
    <>
      <TransferImport />
      {activeTab === 'log'      && <LogPage />}
      {activeTab === 'stats'    && <StatsPage />}
      {activeTab === 'analysis' && <AnalysisPage />}
      {activeTab === 'plan'     && <PlanPage />}
      {activeTab === 'profile'  && <ProfilePage />}
      <BottomNav />
    </>
  )
}
