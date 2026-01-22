import { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 3 / 4;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
`

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* 거울 모드 */
`

const Canvas = styled.canvas`
  display: none;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 24px;
`

const CaptureButton = styled.button`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid #ccc;
  cursor: pointer;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`

const CloseButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
  padding: 20px;
`

const LoadingMessage = styled.p`
  color: #fff;
  font-size: 14px;
`

function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    setError(null)
    setIsReady(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true)
        }
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err)
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsReady(false)
  }

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 캔버스 크기를 비디오 크기에 맞춤
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 거울 모드로 그리기
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    // base64로 변환
    const imageData = canvas.toDataURL('image/jpeg', 0.8)

    onCapture(imageData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Overlay>
      <VideoContainer>
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : !isReady ? (
          <LoadingMessage>카메라 로딩 중...</LoadingMessage>
        ) : null}
        <Video ref={videoRef} autoPlay playsInline muted />
      </VideoContainer>

      <Canvas ref={canvasRef} />

      <ButtonContainer>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <CaptureButton onClick={handleCapture} disabled={!isReady} />
      </ButtonContainer>
    </Overlay>
  )
}

export default CameraModal
