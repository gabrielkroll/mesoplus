const PIN_KEY     = 'mp7_pin'
const SESSION_KEY = 'mp7_session'

export function hashPw(pw) {
  const s = pw + 'mp7salt'
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)
    h = h >>> 0
  }
  return h.toString(36)
}

export const hasPin      = ()   => !!localStorage.getItem(PIN_KEY)
export const checkPin    = (pw) => hashPw(pw) === localStorage.getItem(PIN_KEY)
export const savePin     = (pw) => localStorage.setItem(PIN_KEY, hashPw(pw))
export const isUnlocked  = ()   => !!sessionStorage.getItem(SESSION_KEY)
export const markSession = ()   => sessionStorage.setItem(SESSION_KEY, '1')
export const clearSession= ()   => sessionStorage.removeItem(SESSION_KEY)
