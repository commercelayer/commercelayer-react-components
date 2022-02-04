import { useEffect, useState } from 'react'

export default function useExternalScript(url: string): boolean {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      setLoaded(true)
    }
    return () => {
      document.body.removeChild(script)
      setLoaded(false)
    }
  }, [url])
  return loaded
}
