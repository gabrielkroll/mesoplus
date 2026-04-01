import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import SheetBase from './SheetBase'
import styles from './NotesSheet.module.css'

const today = () => new Date().toISOString().split('T')[0]

export default function NotesSheet({ isOpen, onClose }) {
  const sessions   = useStore(s => s.sessions)
  const addSession = useStore(s => s.addSession)

  const date    = today()
  const session = sessions.find(s => s.date === date) || {}
  const [text, setText] = useState(session.notes || '')

  // Sync text when session changes externally
  useEffect(() => {
    setText(session.notes || '')
  }, [session.notes])

  const save = () => {
    addSession({ ...session, date, notes: text.trim() })
    onClose()
  }

  return (
    <SheetBase
      isOpen={isOpen}
      onClose={save}
      layoutId="card-notes"
      title="Notes"
      titleId="notes-title"
      footer={
        <button className={styles.saveBtn} onClick={save}>
          Save &amp; close
        </button>
      }
    >
      <textarea
        className={styles.textarea}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="How did today feel? Anything to remember for next session…"
        aria-label="Session notes"
        rows={10}
        autoFocus={isOpen}
      />
    </SheetBase>
  )
}
