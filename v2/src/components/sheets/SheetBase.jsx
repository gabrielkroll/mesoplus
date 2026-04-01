import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import styles from './SheetBase.module.css'

/**
 * Reusable full-sheet wrapper.
 * layoutId connects this sheet to the card that triggered it —
 * Framer Motion animates the morph between card and sheet.
 */
export default function SheetBase({
  isOpen,
  onClose,
  layoutId,
  title,
  titleId,
  children,
  footer,
}) {
  const closeRef = useRef(null)

  // Focus close button when sheet opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => closeRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet — shares layoutId with the triggering card */}
          <motion.div
            layoutId={layoutId}
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ borderRadius: 8 }}
            animate={{ borderRadius: 16 }}
            exit={{ borderRadius: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {/* Sheet header */}
            <div className={styles.header}>
              <motion.h2
                id={titleId}
                className={styles.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
              >
                {title}
              </motion.h2>
              <button
                ref={closeRef}
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            {/* Sheet content */}
            <motion.div
              className={styles.content}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.08 }}
            >
              {children}
            </motion.div>

            {/* Optional footer (Close button etc.) */}
            {footer && (
              <motion.div
                className={styles.footer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
              >
                {footer}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
