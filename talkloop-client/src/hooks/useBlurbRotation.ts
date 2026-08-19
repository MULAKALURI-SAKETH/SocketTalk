import { useEffect, useState } from 'react'

const useBlurbRotation = <T>(items: T[], intervalMs = 4000) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % items.length)
    }, intervalMs)
    return () => window.clearInterval(intervalId)
  }, [items.length, intervalMs])

  return currentIndex
}

export default useBlurbRotation
