import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { getInput, setResult } from '../lib/storage'
import { mockAnalyze } from '../lib/analyze'

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
`

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
`

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '✨';
    position: absolute;
    top: 20%;
    left: 20%;
    font-size: 24px;
    animation: ${sparkle} 2s ease-in-out infinite;
  }

  &::after {
    content: '💫';
    position: absolute;
    top: 30%;
    right: 15%;
    font-size: 20px;
    animation: ${sparkle} 2.5s ease-in-out infinite 0.5s;
  }
`

const SparkleEmoji = styled.span<{ $top: string; $left: string; $delay: number }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  font-size: 18px;
  animation: ${sparkle} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  text-align: center;
  animation: ${float} 3s ease-in-out infinite;
`

// 고양이 애니메이션
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`

const walk = keyframes`
  0% {
    transform: translateX(-30px);
  }
  100% {
    transform: translateX(250px);
  }
`

const tailWag = keyframes`
  0%, 100% {
    transform: rotate(-20deg);
  }
  50% {
    transform: rotate(20deg);
  }
`

const earTwitch = keyframes`
  0%, 90%, 100% {
    transform: rotate(0deg);
  }
  95% {
    transform: rotate(-10deg);
  }
`

const blink = keyframes`
  0%, 45%, 55%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.1);
  }
`

const CatContainer = styled.div`
  width: 100%;
  max-width: 280px;
  height: 80px;
  position: relative;
  margin-bottom: 16px;
  overflow: hidden;
`

const Cat = styled.div<{ $delay: number; $duration: number; $color: string }>`
  position: absolute;
  bottom: 10px;
  left: 0;
  animation: ${walk} ${({ $duration }) => $duration}s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`

const CatBody = styled.div<{ $color: string }>`
  position: relative;
  animation: ${bounce} 0.5s ease-in-out infinite;
`

const CatFace = styled.div<{ $color: string }>`
  width: 36px;
  height: 32px;
  background: ${({ $color }) => $color};
  border-radius: 50% 50% 45% 45%;
  position: relative;
  z-index: 2;
`

const CatEar = styled.div<{ $side: 'left' | 'right'; $color: string }>`
  position: absolute;
  top: -8px;
  ${({ $side }) => ($side === 'left' ? 'left: 3px;' : 'right: 3px;')}
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 12px solid ${({ $color }) => $color};
  animation: ${earTwitch} 2s ease-in-out infinite;
  animation-delay: ${({ $side }) => ($side === 'left' ? '0s' : '0.1s')};
`

const CatEarInner = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: -5px;
  ${({ $side }) => ($side === 'left' ? 'left: 5px;' : 'right: 5px;')}
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-bottom: 7px solid #ffb6c1;
`

const CatEye = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 10px;
  ${({ $side }) => ($side === 'left' ? 'left: 7px;' : 'right: 7px;')}
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  animation: ${blink} 3s ease-in-out infinite;
  animation-delay: ${({ $side }) => ($side === 'left' ? '0s' : '0.1s')};
  
  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 2px;
    width: 3px;
    height: 3px;
    background: white;
    border-radius: 50%;
  }
`

const CatNose = styled.div`
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 4px;
  background: #ff9999;
  border-radius: 50%;
`

const CatMouth = styled.div`
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 5px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border: 1.5px solid #666;
    border-top: none;
    border-left: none;
    border-radius: 0 0 50% 0;
  }
  
  &::before {
    left: -1px;
    transform: rotate(-45deg);
  }
  
  &::after {
    right: -1px;
    transform: rotate(45deg) scaleX(-1);
  }
`

const CatWhisker = styled.div<{ $side: 'left' | 'right'; $position: number }>`
  position: absolute;
  top: ${({ $position }) => 16 + $position * 3}px;
  ${({ $side }) => ($side === 'left' ? 'left: -8px;' : 'right: -8px;')}
  width: 12px;
  height: 1px;
  background: #888;
  transform: rotate(${({ $side, $position }) => 
    $side === 'left' 
      ? -10 + $position * 10 
      : 10 - $position * 10}deg);
`

const CatBodyMain = styled.div<{ $color: string }>`
  position: absolute;
  top: 20px;
  left: -5px;
  width: 28px;
  height: 22px;
  background: ${({ $color }) => $color};
  border-radius: 50% 60% 50% 40%;
  z-index: 1;
`

const CatTail = styled.div<{ $color: string }>`
  position: absolute;
  top: 18px;
  left: -20px;
  width: 20px;
  height: 6px;
  background: ${({ $color }) => $color};
  border-radius: 10px 0 0 10px;
  transform-origin: right center;
  animation: ${tailWag} 0.3s ease-in-out infinite;
`

const CatLeg = styled.div<{ $position: number; $color: string }>`
  position: absolute;
  bottom: -8px;
  left: ${({ $position }) => $position}px;
  width: 5px;
  height: 10px;
  background: ${({ $color }) => $color};
  border-radius: 0 0 3px 3px;
`

const ProgressBarWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 20px rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #8b5cf6, #3b82f6);
  border-radius: 20px;
  transition: width 0.1s ease;
  background-size: 300% 100%;
  animation: shimmer 2s linear infinite;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  
  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
`

const ProgressText = styled.span`
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 8px;
`

const LoadingMessage = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 24px;
  text-align: center;
  line-height: 1.6;
`

const LoadingTips = styled.div`
  margin-top: 32px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 300px;
`

const TipText = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  line-height: 1.5;
`

// 고양이 컴포넌트
const CatCharacter = ({ delay, duration, color }: { delay: number; duration: number; color: string }) => (
  <Cat $delay={delay} $duration={duration} $color={color}>
    <CatBody $color={color}>
      <CatTail $color={color} />
      <CatBodyMain $color={color} />
      <CatFace $color={color}>
        <CatEar $side="left" $color={color} />
        <CatEarInner $side="left" />
        <CatEar $side="right" $color={color} />
        <CatEarInner $side="right" />
        <CatEye $side="left" />
        <CatEye $side="right" />
        <CatNose />
        <CatMouth />
        <CatWhisker $side="left" $position={0} />
        <CatWhisker $side="left" $position={1} />
        <CatWhisker $side="left" $position={2} />
        <CatWhisker $side="right" $position={0} />
        <CatWhisker $side="right" $position={1} />
        <CatWhisker $side="right" $position={2} />
      </CatFace>
      <CatLeg $position={0} $color={color} />
      <CatLeg $position={8} $color={color} />
      <CatLeg $position={16} $color={color} />
      <CatLeg $position={22} $color={color} />
    </CatBody>
  </Cat>
)

function Loading() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const input = getInput()
    if (!input) {
      navigate('/')
      return
    }

    // 프로그레스 애니메이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 8
      })
    }, 100)

    // 분석 실행
    mockAnalyze(input).then((result) => {
      clearInterval(progressInterval)
      setProgress(100)
      setResult(result)

      setTimeout(() => {
        navigate('/result')
      }, 300)
    })

    return () => clearInterval(progressInterval)
  }, [navigate])

  return (
    <Container>
      <SparkleEmoji $top="15%" $left="10%" $delay={0}>⭐</SparkleEmoji>
      <SparkleEmoji $top="25%" $left="85%" $delay={1}>🌟</SparkleEmoji>
      <SparkleEmoji $top="70%" $left="8%" $delay={1.5}>💎</SparkleEmoji>
      <SparkleEmoji $top="75%" $left="90%" $delay={2}>✨</SparkleEmoji>
      
      <Title>🔮 AI가 분석중이에요...</Title>
      <CatContainer>
        <CatCharacter delay={0} duration={4} color="#FFB347" />
        <CatCharacter delay={1.5} duration={5} color="#87CEEB" />
        <CatCharacter delay={3} duration={4.5} color="#DDA0DD" />
      </CatContainer>
      <ProgressBarWrapper>
        <ProgressBarFill $progress={progress} />
      </ProgressBarWrapper>
      <ProgressText>{Math.round(progress)}%</ProgressText>
      <LoadingMessage>
        🐱 귀여운 고양이들이 열심히 분석하고 있어요!
      </LoadingMessage>
      <LoadingTips>
        <TipText>
          💡 Tip: 정면 사진일수록<br />더 정확한 분석이 가능해요!
        </TipText>
      </LoadingTips>
    </Container>
  )
}

export default Loading
