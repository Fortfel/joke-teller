import type { JokeApiResponse } from '@/lib/api'
import { useCallback, useRef, useState } from 'react'

import { fetchJoke, fetchTts } from '@/lib/api'

export function App() {
  const [jokeText, setJokeText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isFadedIn, setIsFadedIn] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFadeOut = useCallback(() => {
    setIsFadedIn(false)
  }, [])

  const handleTransitionEnd = useCallback(() => {
    if (!isFadedIn) {
      setIsVisible(false)
      setIsDisabled(false)
    }
  }, [isFadedIn])

  const handleClick = useCallback(async () => {
    setIsDisabled(true)

    try {
      const joke: JokeApiResponse = await fetchJoke()
      const text = joke.type === 'single' ? joke.joke : `${joke.setup} ... ${joke.delivery}`

      setJokeText(text.replaceAll('...', '\n'))

      // Show joke with fade-in
      setIsVisible(true)
      // Use rAF to ensure the element is rendered before fading in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsFadedIn(true)
        })
      })

      // Start TTS via backend
      const audioData = await fetchTts(text)
      const audio = audioRef.current
      if (audio) {
        audio.src = audioData
        audio.play().catch(console.error)

        // Set fallback timer
        const timeoutId = setTimeout(handleFadeOut, 5000)

        audio.addEventListener(
          'canplay',
          () => {
            clearTimeout(timeoutId)
          },
          { once: true },
        )

        audio.addEventListener('ended', handleFadeOut, { once: true })
      }
    } catch (error) {
      console.error(error)
      setJokeText('Something went wrong. Please try again later.')
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsFadedIn(true)
        })
      })

      setTimeout(handleFadeOut, 5000)
    }
  }, [handleFadeOut])

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        className="cursor-pointer rounded-md bg-[hsl(337,100%,60%)] px-10 py-2.5 font-mono text-lg font-semibold text-white shadow-[5px_5px_30px_20px_rgba(0,0,0,0.5)] hover:bg-[hsl(337,100%,65%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(337,100%,60%)] active:scale-98 disabled:scale-none disabled:cursor-default disabled:opacity-90 disabled:hover:bg-[hsl(337,100%,60%)] lg:shadow-[2px_2px_20px_10px_rgba(0,0,0,0.2)]"
      >
        Tell Me A Joke
      </button>

      <div
        className={`m-4 max-w-xl rounded bg-[hsla(0,0%,100%,0.9)] p-4 text-xl whitespace-pre-line shadow-lg transition-opacity duration-500 ${
          isVisible ? '' : 'hidden'
        } ${isFadedIn ? 'opacity-100' : 'opacity-0'}`}
        onTransitionEnd={handleTransitionEnd}
      >
        {jokeText}
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} hidden />
    </div>
  )
}
