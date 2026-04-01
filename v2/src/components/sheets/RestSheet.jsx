import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import Button from '../atoms/Button'
import { today } from '../../lib/dates'
import styles from './RestSheet.module.css'



const REST_QUOTES = [
  { q: 'It is during our darkest moments that we must focus to see the light.', attr: 'Aristotle' },
  { q: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", attr: 'Ralph Marston' },
  { q: 'Almost everything will work again if you unplug it for a few minutes — including you.', attr: 'Anne Lamott' },
  { q: "Recovery is not a sign of weakness. It's the foundation of strength.", attr: 'Unknown' },
  { q: 'The body heals with play, the mind heals with laughter, and the spirit heals with joy.', attr: 'Proverb' },
  { q: 'Take rest; a field that has rested gives a bountiful crop.', attr: 'Ovid' },
  { q: 'Slow down and everything you are chasing will come around and catch you.', attr: 'John De Paola' },
]

// Pick a stable quote for the session date
function quoteForDate(date) {
  const idx = date.split('-').reduce((a, v) => a + parseInt(v), 0) % REST_QUOTES.length
  return REST_QUOTES[idx]
}

export default function RestSheet({ isOpen, onClose }) {
  const addSession     = useStore(s => s.addSession)
  const sessions       = useStore(s => s.sessions)
  const openSheet      = useStore(s => s.openSheet)
  const removeTraining = useStore(s => s.removeTraining)

  const date    = today()
  const session = sessions.find(s => s.date === date) || {}
  const quote   = quoteForDate(date)

  // Mark training type as Rest when sheet opens
  const handleOpen = () => {
    if (!session.dtype) {
      addSession({ ...session, date, dtype: 'Rest' })
    }
  }

  // Call handleOpen when isOpen becomes true
  if (isOpen && !session.dtype) {
    addSession({ ...session, date, dtype: 'Rest' })
  }

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={onClose}
      layoutId="card-rest"
      title="Rest"
      titleId="rest-title"
      footer={<Button fullWidth variant="ghost" onClick={onClose}>Close</Button>}
    >
      <div className={styles.quoteWrap}>
        <blockquote className={styles.quote}>
          "{quote.q}"
        </blockquote>
        <cite className={styles.attr}>— {quote.attr}</cite>
        <p className={styles.sub}>
          Rest is not a reward for hard work.<br />
          It is part of the work itself.
        </p>
      </div>

      <Button
        fullWidth
        variant="ghost"
        onClick={() => { onClose(); setTimeout(() => openSheet('notes'), 250) }}
      >
        Take reflection notes
      </Button>
      <Button
        fullWidth
        variant="danger"
        onClick={() => { removeTraining(date); onClose() }}
      >
        Change training type
      </Button>
    </SheetBase>
  )
}
