import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { setInput, type FaceAppInput, type Gender } from '../lib/storage'
import BottomCTA from '../components/BottomCTA'
import CameraModal from '../components/CameraModal'

const float = keyframes`
  0% { 
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  10% { 
    transform: translateY(-12px) rotate(1.5deg) scale(1.01);
  }
  20% { 
    transform: translateY(-28px) rotate(2.5deg) scale(1.03);
  }
  30% { 
    transform: translateY(-38px) rotate(1deg) scale(1.06);
  }
  40% { 
    transform: translateY(-42px) rotate(-1deg) scale(1.08);
  }
  50% { 
    transform: translateY(-38px) rotate(-2.5deg) scale(1.06);
  }
  60% { 
    transform: translateY(-28px) rotate(-1.5deg) scale(1.03);
  }
  70% { 
    transform: translateY(-15px) rotate(0.5deg) scale(1.01);
  }
  80% { 
    transform: translateY(-5px) rotate(1deg) scale(1);
  }
  90% { 
    transform: translateY(-2px) rotate(-0.5deg) scale(1);
  }
  100% { 
    transform: translateY(0px) rotate(0deg) scale(1);
  }
`

const glow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 4px 15px rgba(139, 92, 246, 0.2));
  }
  25% { 
    filter: drop-shadow(0 8px 35px rgba(139, 92, 246, 0.5)) drop-shadow(0 0 50px rgba(236, 72, 153, 0.3));
  }
  50% { 
    filter: drop-shadow(0 12px 50px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 80px rgba(59, 130, 246, 0.5));
  }
  75% { 
    filter: drop-shadow(0 8px 35px rgba(139, 92, 246, 0.5)) drop-shadow(0 0 50px rgba(236, 72, 153, 0.3));
  }
`

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    animation: ${float} 15s ease-in-out infinite;
  }
`

const LogoArea = styled.div`
  width: 100%;
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`

const LogoImage = styled.img`
  width: 85%;
  max-width: 320px;
  height: auto;
  object-fit: contain;
  animation: 
    ${float} 5s cubic-bezier(0.37, 0, 0.63, 1) infinite,
    ${glow} 4s ease-in-out infinite;
`

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
`

const InputField = styled.input`
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0 20px;
  font-size: 16px; /* 모바일에서 줌 방지 */
  color: #fff;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 10;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(139, 92, 246, 0.6);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
  }
`

const ThumbnailArea = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`

const Thumbnail = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const DeleteButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);

  &:hover {
    transform: scale(1.1);
  }
`

const EmptyThumbnail = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: rgba(255, 255, 255, 0.3);
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
`

const UploadButton = styled.button<{ $variant: 'gallery' | 'camera' }>`
  flex: 1;
  height: 56px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: ${({ $variant }) =>
    $variant === 'gallery'
      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'};
  box-shadow: ${({ $variant }) =>
    $variant === 'gallery'
      ? '0 4px 20px rgba(59, 130, 246, 0.4)'
      : '0 4px 20px rgba(139, 92, 246, 0.4)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $variant }) =>
      $variant === 'gallery'
        ? '0 8px 30px rgba(59, 130, 246, 0.5)'
        : '0 8px 30px rgba(139, 92, 246, 0.5)'};
  }
`

const HiddenInput = styled.input`
  display: none;
`

const GenderSection = styled.div`
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
`

const GenderToggle = styled.div`
  display: flex;
  gap: 12px;
`

const GenderButton = styled.button<{ $selected: boolean; $gender: 'female' | 'male' }>`
  flex: 1;
  height: 56px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${({ $selected, $gender }) =>
    $selected
      ? $gender === 'female'
        ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $selected }) => ($selected ? '#fff' : 'rgba(255, 255, 255, 0.7)')};
  border: 2px solid ${({ $selected }) =>
    $selected
      ? 'transparent'
      : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(10px);
  box-shadow: ${({ $selected, $gender }) =>
    $selected
      ? $gender === 'female'
        ? '0 4px 20px rgba(236, 72, 153, 0.4)'
        : '0 4px 20px rgba(59, 130, 246, 0.4)'
      : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ $selected, $gender }) =>
      $selected
        ? $gender === 'female'
          ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
          : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        : 'rgba(255, 255, 255, 0.15)'};
  }
`

const InfoCard = styled.div`
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`

const InfoText = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  text-align: center;
`

// 모바일 기기 감지
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

function Home() {
  const navigate = useNavigate()
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [age, setAge] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (images.length >= 3) return

      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => {
          if (prev.length >= 3) return prev
          return [...prev, reader.result as string]
        })
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCameraCapture = (imageData: string) => {
    if (images.length >= 3) return
    setImages((prev) => [...prev, imageData])
  }

  const handleCameraClick = () => {
    if (isMobile()) {
      // 모바일: 네이티브 카메라 input 사용
      cameraInputRef.current?.click()
    } else {
      // 데스크톱: CameraModal 사용
      setIsCameraOpen(true)
    }
  }

  const handleAnalyze = () => {
    const input: FaceAppInput = {
      age: age ? parseInt(age) : null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      gender,
      images,
    }
    setInput(input)
    navigate('/loading')
  }

  const isValid = images.length > 0 && gender !== null

  return (
    <>
      <Container>
        <LogoArea>
          <LogoImage src="/logo.png" alt="응니얼굴" />
        </LogoArea>

        <InfoCard>
          <InfoText>
            ✨ AI가 당신의 외모를 분석하고<br />
            맞춤 스타일을 추천해드려요! ✨
          </InfoText>
        </InfoCard>

        <GenderSection>
          <SectionTitle>👤 성별 선택</SectionTitle>
          <GenderToggle>
            <GenderButton
              $selected={gender === 'female'}
              $gender="female"
              onClick={() => setGender('female')}
            >
              👩 여성
            </GenderButton>
            <GenderButton
              $selected={gender === 'male'}
              $gender="male"
              onClick={() => setGender('male')}
            >
              👨 남성
            </GenderButton>
          </GenderToggle>
        </GenderSection>

        <SectionTitle>📝 기본 정보</SectionTitle>
        <InputGroup>
          <InputField
            type="number"
            placeholder="🎂 나이"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <InputField
            type="number"
            placeholder="📏 키 (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <InputField
            type="number"
            placeholder="⚖️ 몸무게 (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </InputGroup>

        <SectionTitle>📸 사진 업로드 ({images.length}/3)</SectionTitle>
        <ThumbnailArea>
          {images.map((img, idx) => (
            <Thumbnail key={idx}>
              <ThumbnailImage src={img} alt={`업로드 ${idx + 1}`} />
              <DeleteButton onClick={() => removeImage(idx)}>×</DeleteButton>
            </Thumbnail>
          ))}
          {images.length < 3 && (
            <EmptyThumbnail onClick={() => galleryInputRef.current?.click()}>
              +
            </EmptyThumbnail>
          )}
        </ThumbnailArea>

        <ButtonGroup>
          <UploadButton
            $variant="gallery"
            onClick={() => galleryInputRef.current?.click()}
          >
            🖼️ 사진첩
          </UploadButton>
          <UploadButton
            $variant="camera"
            onClick={handleCameraClick}
          >
            📷 카메라
          </UploadButton>
        </ButtonGroup>

        <HiddenInput
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Container>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {!isCameraOpen && (
        <BottomCTA
          label="🔮 분석하기"
          onClick={handleAnalyze}
          disabled={!isValid}
        />
      )}
    </>
  )
}

export default Home
