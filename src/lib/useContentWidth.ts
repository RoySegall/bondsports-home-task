import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

// Tracks an element's content width (clientWidth minus horizontal padding),
// re-measuring on element resize and window resize. Returns [ref, width]; attach the
// ref to the element you want measured. The initial measure runs synchronously in a
// layout effect, so the first paint already has the width (the observer is a backup).
export function useContentWidth<T extends HTMLElement>(): [RefObject<T>, number] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    const measure = () => {
      const style = getComputedStyle(element)
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      setWidth(element.clientWidth - padX)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return [ref, width]
}
