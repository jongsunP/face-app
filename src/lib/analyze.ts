import type { FaceAppInput, FaceAppResult } from './storage'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// 입력값 기반 해시 생성 (일관된 결과를 위해)
function generateHash(input: FaceAppInput): number {
  const str = `${input.age}-${input.height}-${input.weight}-${input.gender}-${input.images.length}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function mockAnalyze(input: FaceAppInput): Promise<FaceAppResult> {
  return new Promise((resolve) => {
    // 4초 정도 로딩 (귀여운 고양이들을 볼 수 있도록!)
    const delay = 3500 + Math.random() * 1000

    setTimeout(() => {
      // 기본 점수: 60점 (약간 관대하게)
      let score = 60

      // === BMI 기반 평가 (더 관대하게) ===
      if (input.height && input.weight && input.height > 0) {
        const heightM = input.height / 100
        const bmi = input.weight / (heightM * heightM)

        if (bmi < 16) {
          score -= 8
        } else if (bmi < 18.5) {
          // 슬림한 체형
          score += 3
        } else if (bmi >= 18.5 && bmi < 21) {
          // 이상적 체형
          score += 12
        } else if (bmi >= 21 && bmi < 23) {
          // 좋은 체형
          score += 8
        } else if (bmi >= 23 && bmi < 25) {
          // 평균 (괜찮음)
          score += 3
        } else if (bmi >= 25 && bmi < 28) {
          // 약간 통통
          score -= 2
        } else if (bmi >= 28 && bmi < 30) {
          // 관리 필요
          score -= 5
        } else if (bmi >= 30 && bmi < 35) {
          // 노력 필요
          score -= 8
        } else {
          score -= 12
        }
      }

      // === 나이 기반 평가 (더 관대하게) ===
      if (input.age) {
        if (input.age < 20) {
          // 어린 에너지
          score += 5
        } else if (input.age >= 20 && input.age <= 26) {
          // 전성기
          score += 12
        } else if (input.age >= 27 && input.age <= 32) {
          // 좋은 시기
          score += 8
        } else if (input.age >= 33 && input.age <= 38) {
          // 성숙한 매력
          score += 4
        } else if (input.age >= 39 && input.age <= 45) {
          // 관리에 따라 다름
          score += 0
        } else if (input.age > 45) {
          // 경험의 매력
          score -= 3
        }
      }

      // === 성별 기반 보너스 ===
      if (input.gender === 'female') {
        score += 2 // 여성 약간 보너스
      } else if (input.gender === 'male') {
        score += 1 // 남성도 보너스
      }

      // === 이미지 개수 (노력 점수) ===
      if (input.images.length === 0) {
        score -= 5
      } else if (input.images.length === 1) {
        score += 3
      } else if (input.images.length === 2) {
        score += 5
      } else if (input.images.length >= 3) {
        score += 8
      }

      // === 입력값 기반 다양한 변동 ===
      const hash = generateHash(input)
      const variation = (hash % 21) - 10 // -10 ~ +10 범위로 확대
      score += variation

      // 점수 클램핑 (최저 35점, 최고 98점 - 더 넓은 범위)
      score = clamp(score, 35, 98)

      // === 헌팅 성공률: 점수에 비례 (더 다양하게) ===
      let huntingRate: number
      if (score >= 90) {
        huntingRate = clamp(Math.round(70 + (score - 90) * 2), 70, 92)
      } else if (score >= 80) {
        huntingRate = clamp(Math.round(50 + (score - 80) * 2), 50, 69)
      } else if (score >= 70) {
        huntingRate = clamp(Math.round(35 + (score - 70) * 1.5), 35, 49)
      } else if (score >= 60) {
        huntingRate = clamp(Math.round(22 + (score - 60) * 1.3), 22, 34)
      } else if (score >= 50) {
        huntingRate = clamp(Math.round(12 + (score - 50)), 12, 21)
      } else {
        huntingRate = clamp(Math.round(5 + (score - 35) * 0.5), 5, 11)
      }

      // === 결정사 비용: 점수에 따라 다양하게 ===
      let agencyCost: number
      if (score >= 90) {
        agencyCost = clamp(Math.round(120 - (score - 90) * 5), 80, 120)
      } else if (score >= 80) {
        agencyCost = clamp(Math.round(200 - (score - 80) * 8), 120, 200)
      } else if (score >= 70) {
        agencyCost = clamp(Math.round(300 - (score - 70) * 10), 200, 300)
      } else if (score >= 60) {
        agencyCost = clamp(Math.round(400 - (score - 60) * 10), 300, 400)
      } else if (score >= 50) {
        agencyCost = clamp(Math.round(480 - (score - 50) * 8), 400, 480)
      } else {
        agencyCost = clamp(Math.round(550 - (score - 35) * 5), 480, 550)
      }

      resolve({
        score,
        huntingRate,
        agencyCost,
      })
    }, delay)
  })
}
