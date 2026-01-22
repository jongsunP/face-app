export type Gender = 'female' | 'male'

export interface FaceAppInput {
  age: number | null
  height: number | null
  weight: number | null
  gender: Gender | null
  images: string[]
}

export interface FaceAppResult {
  score: number
  huntingRate: number
  agencyCost: number
}

const KEYS = {
  INPUT: 'faceapp_input',
  RESULT: 'faceapp_result',
} as const

export function getInput(): FaceAppInput | null {
  const data = localStorage.getItem(KEYS.INPUT)
  if (!data) return null
  try {
    return JSON.parse(data) as FaceAppInput
  } catch {
    return null
  }
}

export function setInput(input: FaceAppInput): void {
  localStorage.setItem(KEYS.INPUT, JSON.stringify(input))
}

export function getResult(): FaceAppResult | null {
  const data = localStorage.getItem(KEYS.RESULT)
  if (!data) return null
  try {
    return JSON.parse(data) as FaceAppResult
  } catch {
    return null
  }
}

export function setResult(result: FaceAppResult): void {
  localStorage.setItem(KEYS.RESULT, JSON.stringify(result))
}

export function clearAll(): void {
  localStorage.removeItem(KEYS.INPUT)
  localStorage.removeItem(KEYS.RESULT)
}
