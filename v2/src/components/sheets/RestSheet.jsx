import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
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

const today = () => new Date().toISOString().split('T')[0]

export default function RestSheet({ isOpen, onClose }) {
  const addSession = useStore(s => s.addSession)
  const sessions   = useStore(s => s.sessions)
  const openSheet  = useStore(s => s.openSheet)

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
      footer={
        <button className={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      }
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

      <button
        className={styles.notesBtn}
        onClick={() => { onClose(); setTimeout(() => openSheet('notes'), 250) }}
        aria-label="Add reflection notes for your rest day"
      >
        Take reflection notes
      </button>
    </SheetBase>
  )
}
