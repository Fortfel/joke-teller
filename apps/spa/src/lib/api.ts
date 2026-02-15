import { env } from '@/env'

const API_BASE = `${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}`

type JokeApiSingle = {
  type: 'single'
  joke: string
}

type JokeApiTwoPart = {
  type: 'twopart'
  setup: string
  delivery: string
}

export type JokeApiResponse = JokeApiSingle | JokeApiTwoPart

export async function fetchJoke(): Promise<JokeApiResponse> {
  const response = await fetch(`${API_BASE}/joke`)

  if (!response.ok) {
    throw new Error('Failed to fetch joke')
  }

  return response.json() as Promise<JokeApiResponse>
}

export async function fetchTts(text: string): Promise<string> {
  const response = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error('TTS request failed')
  }

  const data = (await response.json()) as { audio: string }
  return data.audio
}
