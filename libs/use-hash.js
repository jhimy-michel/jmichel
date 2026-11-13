import { useEffect, useState } from 'react'
import Router from 'next/router'

// Current URL hash ('' or e.g. '#about'), kept in sync with Next navigation
// and the back button. Read on the client only, so it starts as ''
export const useHash = () => {
  const [hash, setHash] = useState('')
  useEffect(() => {
    const sync = () => setHash(window.location.hash)
    sync()
    Router.events.on('hashChangeComplete', sync)
    Router.events.on('routeChangeComplete', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      Router.events.off('hashChangeComplete', sync)
      Router.events.off('routeChangeComplete', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])
  return hash
}
