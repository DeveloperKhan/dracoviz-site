import { debounce } from "lodash"
import { useState, useEffect } from "react"

export default function useWindowSize() {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    // Debounce to avoid the function fire multiple times
    var handleResizeDebounced = debounce(function handleResize() {
      setWindowSize(getSize())
    }, 250)

    window.addEventListener("resize", handleResizeDebounced)
    return () => window.removeEventListener("resize", handleResizeDebounced)
  }, [])

  return windowSize
}