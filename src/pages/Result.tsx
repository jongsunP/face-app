import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import {
  getInput,
  getResult,
  clearAll,
  type FaceAppInput,
  type FaceAppResult,
  type Gender,
} from '../lib/storage'

// ============ Share Data Types ============

interface ShareData {
  gender: Gender | null
  score: number
  huntingRate: number
  agencyCost: number
  image?: string // base64 이미지 (선택적)
}

// 공유 데이터 인코딩/디코딩
function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data)
  return btoa(encodeURIComponent(json))
}

function decodeShareData(encoded: string): ShareData | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json) as ShareData
  } catch {
    return null
  }
}

// ============ Animations ============

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
`

// ============ Styled Components ============

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-bottom: 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
`

const SharedBanner = styled.div`
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
  color: #fff;
  text-align: center;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  animation: ${fadeInUp} 0.4s ease-out;
`

const SharedResultIcon = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
  margin-bottom: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: ${pulse} 2s ease-in-out infinite;
`

// 이미지 갤러리 스타일
const ImageGallery = styled.div`
  width: 100%;
  margin-bottom: 24px;
  position: relative;
`

const ImageSlider = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 12px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  @media (max-width: 480px) {
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

const GalleryImage = styled.div<{ $single?: boolean }>`
  flex-shrink: 0;
  width: ${({ $single }) => ($single ? '100%' : '85%')};
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  scroll-snap-align: center;
`

const GalleryImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ImageCounter = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-top: 8px;
`

const SummaryCard = styled.div`
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${fadeInUp} 0.5s ease-out;
`

const ScoreNumber = styled.div`
  font-size: 64px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  animation: ${glow} 2s ease-in-out infinite;
  text-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
`

const SummaryLine = styled.p<{ $bold?: boolean; $highlight?: boolean }>`
  font-size: ${({ $bold }) => ($bold ? '18px' : '15px')};
  font-weight: ${({ $bold }) => ($bold ? '700' : '400')};
  color: ${({ $bold, $highlight }) => 
    $highlight ? '#a5b4fc' : ($bold ? '#fff' : 'rgba(255, 255, 255, 0.8)')};
  margin-bottom: 10px;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
`

const Section = styled.section`
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.6s ease-out;
  animation-fill-mode: both;

  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.3s; }
  &:nth-child(5) { animation-delay: 0.4s; }
`

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Paragraph = styled.p`
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
`

const HorizontalScroll = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 14px;
  margin-bottom: 14px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }

  /* 스크롤바 숨기기 (모바일) */
  @media (max-width: 480px) {
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

const HairCard = styled.a`
  flex-shrink: 0;
  width: 150px;
  scroll-snap-align: start;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  display: block;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
  }

  &:active {
    transform: scale(0.98);
  }
`

const CardImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 130px;
  background: ${({ $imageUrl }) => $imageUrl ? `url(${$imageUrl})` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const CardText = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
`

const SmallNote = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 12px;
  text-align: center;
`

const ClothGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
`

const ClothCardLink = styled.a`
  display: block;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-4px);
  }

  &:active {
    transform: scale(0.98);
  }
`

const ClothImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ $imageUrl }) => $imageUrl ? `url(${$imageUrl})` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'};
  background-size: cover;
  background-position: center;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const ClothName = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
`

const ClothDesc = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`

const effectPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(16, 185, 129, 0.2);
  }
  50% { 
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.5), 0 0 80px rgba(16, 185, 129, 0.4), 0 0 120px rgba(52, 211, 153, 0.2);
  }
`

const numberPop = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`

const EffectCard = styled.div`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.15));
  border: 2px solid rgba(34, 197, 94, 0.5);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
  animation: ${effectPulse} 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '✨';
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 24px;
    animation: ${pulse} 2s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 70%
    );
    animation: ${shimmer} 4s linear infinite;
  }
`

const EffectTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #4ade80, #22d3ee, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
`

const EffectItem = styled.p`
  font-size: 15px;
  color: #fff;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border-left: 4px solid #4ade80;
  gap: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`

const EffectNumber = styled.span`
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${numberPop} 2s ease-in-out infinite;
  margin: 0 4px;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
`

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  height: 54px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  background: ${({ $primary }) =>
    $primary
      ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $primary }) => ($primary ? '#fff' : 'rgba(255, 255, 255, 0.8)')};
  border: ${({ $primary }) => ($primary ? 'none' : '1px solid rgba(255, 255, 255, 0.2)')};
  box-shadow: ${({ $primary }) => ($primary ? '0 4px 20px rgba(139, 92, 246, 0.4)' : 'none')};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $primary }) => ($primary ? '0 8px 30px rgba(139, 92, 246, 0.5)' : '0 4px 20px rgba(255,255,255,0.1)')};
  }
`

// ============ Hair Style Data ============

interface HairStyle {
  name: string
  description: string
  imageUrl: string
}

const maleHairStyles: HairStyle[] = [
  { name: '투블럭 컷', description: '이마 라인을 보완하고 얼굴 비율을 안정적으로 보이게 하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop' },
  { name: '댄디 컷', description: '깔끔하고 단정한 인상을 주며 직장인에게 추천하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop' },
  { name: '리프 컷', description: '자연스러운 볼륨감으로 부드러운 인상을 만들어주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop' },
  { name: '가르마 펌', description: '세련된 느낌과 함께 얼굴형 보완 효과가 뛰어난 스타일', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop' },
  { name: '쉐도우 펌', description: '자연스러운 웨이브로 스타일링이 편하고 유지가 쉬운 스타일', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
  { name: '포마드 스타일', description: '클래식하고 남성적인 느낌을 주는 정돈된 스타일', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop' },
  { name: '텍스쳐 컷', description: '자연스러운 결과 움직임으로 세련된 느낌을 연출하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop' },
  { name: '애즈펌', description: '강한 웨이브로 볼륨감과 개성을 살리는 스타일', imageUrl: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=300&h=300&fit=crop' },
  { name: '크롭 컷', description: '짧고 깔끔하게 정리해 시원하고 활동적인 인상을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&h=300&fit=crop' },
  { name: '슬릭백', description: '이마를 드러내 시원하고 자신감 있는 인상을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop' },
  { name: '뱅헤어', description: '앞머리로 이마를 가려 동안 느낌을 연출하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop' },
  { name: '레이어드 컷', description: '층을 넣어 자연스러운 볼륨과 움직임을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&h=300&fit=crop' },
  { name: '울프 컷', description: '뒷머리에 레이어를 넣어 개성 있고 트렌디한 스타일', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop' },
  { name: '스왈로 컷', description: '옆머리를 길게 흘려 부드러운 인상을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=300&h=300&fit=crop' },
  { name: '시스루 뱅', description: '앞머리를 얇게 내려 세련되고 감각적인 스타일', imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&h=300&fit=crop' },
  { name: '콤마 펌', description: '앞머리를 쉼표 모양으로 연출해 자연스러운 스타일', imageUrl: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=300&h=300&fit=crop' },
  { name: '하이라이트 펌', description: '부분적으로 밝은 색을 넣어 입체감을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=300&fit=crop' },
  { name: '매트 스타일', description: '광택 없이 자연스럽게 연출하는 내추럴 스타일', imageUrl: 'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=300&h=300&fit=crop' },
  { name: '스포츠 컷', description: '짧고 활동적인 느낌의 깔끔한 스타일', imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&h=300&fit=crop' },
  { name: '사이드 파트', description: '옆으로 가르마를 타서 정돈된 느낌을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=300&h=300&fit=crop' },
]

const femaleHairStyles: HairStyle[] = [
  { name: '레이어드 컷', description: '얼굴형을 갸름하게 보이게 하고 자연스러운 볼륨감을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop' },
  { name: '허쉬 컷', description: '세련되고 시크한 분위기를 연출하며 관리가 편한 스타일', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop' },
  { name: '빌드펌', description: '풍성한 볼륨과 자연스러운 웨이브로 여성스러운 느낌의 스타일', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop' },
  { name: '태슬 컷', description: '끝단을 가볍게 정리해 세련되고 트렌디한 느낌을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop' },
  { name: 'C컬 펌', description: '끝을 안쪽으로 말아 단아하고 청순한 이미지를 연출하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop' },
  { name: '히피 펌', description: '자연스러운 웨이브로 보헤미안 느낌을 연출하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=300&fit=crop' },
  { name: '물결 펌', description: '부드러운 S컬로 여성스럽고 우아한 느낌의 스타일', imageUrl: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=300&h=300&fit=crop' },
  { name: '단발 보브', description: '깔끔하고 세련된 느낌의 클래식한 단발 스타일', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop' },
  { name: '시스루 뱅', description: '얇은 앞머리로 부드럽고 여성스러운 느낌을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=300&h=300&fit=crop' },
  { name: '롱 레이어드', description: '긴 머리에 층을 넣어 가벼우면서도 풍성한 느낌의 스타일', imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop' },
  { name: '허그 펌', description: '얼굴을 감싸는 듯한 컬로 얼굴형을 보완하는 스타일', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop' },
  { name: '에어리 컷', description: '공기를 머금은 듯 가볍고 자연스러운 느낌의 스타일', imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop' },
  { name: '샤기 컷', description: '불규칙한 층으로 개성 있고 자유로운 느낌의 스타일', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
  { name: '원랭스 컷', description: '한 길이로 자른 깔끔하고 세련된 스타일', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop' },
  { name: '플리츠 펌', description: '잔잔한 웨이브로 볼륨감과 움직임을 주는 스타일', imageUrl: 'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=300&h=300&fit=crop' },
  { name: '글램 웨이브', description: '화려하고 우아한 느낌의 큰 웨이브 스타일', imageUrl: 'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=300&h=300&fit=crop' },
  { name: '픽시 컷', description: '짧고 경쾌한 느낌으로 얼굴형을 부각시키는 스타일', imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=300&h=300&fit=crop' },
  { name: '볼프 펌', description: '뿌리 볼륨을 살려 풍성하고 화사한 느낌의 스타일', imageUrl: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=300&h=300&fit=crop' },
  { name: '레이어 뱅', description: '층이 있는 앞머리로 자연스럽고 부드러운 스타일', imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop' },
  { name: '미디엄 펌', description: '어깨 길이의 적당한 길이에 자연스러운 컬을 넣은 스타일', imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop' },
]

// 시드 기반 랜덤 선택 (같은 점수면 같은 결과)
function getRandomHairStyles(styles: HairStyle[], seed: number, count: number = 5): HairStyle[] {
  const shuffled = [...styles]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const seedValue = Math.sin(seed * (i + 1)) * 10000
    const j = Math.floor(Math.abs(seedValue - Math.floor(seedValue)) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

// ============ Clothing Style Data ============

interface ClothingItem {
  name: string
  description: string
  imageUrl: string
  productUrl: string
}

// 남성 의류 - 무신사 카테고리 검색 링크
const maleClothingItems: ClothingItem[] = [
  {
    name: '옥스포드 셔츠',
    description: '깔끔한 캐주얼룩의 기본',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001001?gf=A'
  },
  {
    name: '와이드 데님 팬츠',
    description: '편안하면서도 트렌디한 핏',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003002?gf=A'
  },
  {
    name: '크루넥 니트',
    description: '부드러운 소재의 데일리 니트',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001006?gf=A'
  },
  {
    name: '치노 팬츠',
    description: '오피스룩부터 캐주얼까지',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003007?gf=A'
  },
  {
    name: '후드 집업',
    description: '편안한 일상 아우터',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/002007?gf=A'
  },
  {
    name: '반팔 티셔츠',
    description: '여름 데일리 아이템',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001004?gf=A'
  },
  {
    name: '린넨 셔츠',
    description: '시원한 여름 셔츠',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001001?gf=A'
  },
  {
    name: '슬랙스',
    description: '깔끔한 오피스 캐주얼',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003008?gf=A'
  },
  {
    name: '맨투맨',
    description: '편안한 데일리 상의',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001010?gf=A'
  },
  {
    name: '카고 팬츠',
    description: '스트릿 캐주얼 필수템',
    imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003004?gf=A'
  },
]

// 여성 의류 - 무신사 카테고리 검색 링크
const femaleClothingItems: ClothingItem[] = [
  {
    name: '가디건',
    description: '러블리한 봄 아우터',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001008?gf=B'
  },
  {
    name: '미니스커트',
    description: '여성스러운 라인의 스커트',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003002?gf=B'
  },
  {
    name: '와이드 팬츠',
    description: '편안한 데일리 팬츠',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003006?gf=B'
  },
  {
    name: '블라우스',
    description: '우아한 오피스룩',
    imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001002?gf=B'
  },
  {
    name: '롱스커트',
    description: '여성스러운 플리츠 디테일',
    imageUrl: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003002?gf=B'
  },
  {
    name: '데님 자켓',
    description: '캐주얼 데일리 아우터',
    imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/002002?gf=B'
  },
  {
    name: '원피스',
    description: '시원한 여름 원피스',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/020?gf=B'
  },
  {
    name: '부츠컷 팬츠',
    description: '다리가 길어보이는 핏',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003009?gf=B'
  },
  {
    name: '니트',
    description: '로맨틱한 무드의 니트',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/001006?gf=B'
  },
  {
    name: '하이웨스트 데님',
    description: '비율을 살려주는 하이웨스트',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=300&fit=crop',
    productUrl: 'https://www.musinsa.com/categories/item/003002?gf=B'
  },
]

function getRandomClothingItems(items: ClothingItem[], seed: number, count: number = 4): ClothingItem[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const seedValue = Math.sin((seed + 100) * (i + 1)) * 10000
    const j = Math.floor(Math.abs(seedValue - Math.floor(seedValue)) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

// ============ Helper Functions ============

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getScoreComment(score: number): string {
  if (score >= 95) {
    return '상위 1%. 연예인급 외모. 이 정도면 외모로 먹고 살 수 있음'
  } else if (score >= 91) {
    return '상위 3%. 어딜 가든 주목받는 외모. 자신감을 가져도 됨'
  } else if (score >= 87) {
    return '상위 5%. 확실한 상위권. 외모로 손해볼 일 없음'
  } else if (score >= 83) {
    return '상위 10%. 평균 이상 확실함. 첫인상에서 우위 선점'
  } else if (score >= 79) {
    return '상위 15%. 괜찮은 외모. 관리만 잘하면 상위권'
  } else if (score >= 75) {
    return '상위 20%. 나쁘지 않음. 스타일링으로 충분히 커버 가능'
  } else if (score >= 71) {
    return '평균 상위. 눈에 띄는 단점 없음. 노력하면 올라갈 여지 있음'
  } else if (score >= 67) {
    return '평균 약간 위. 무난한 인상. 차별화 포인트가 필요함'
  } else if (score >= 63) {
    return '평균. 특별히 좋지도 나쁘지도 않음. 경쟁이 치열한 구간'
  } else if (score >= 59) {
    return '평균 언저리. 관리 여부에 따라 위아래로 갈림'
  } else if (score >= 55) {
    return '평균 약간 아래. 외모보다 다른 매력을 어필해야 함'
  } else if (score >= 51) {
    return '평균 이하. 솔직히 외모로 승부하기엔 부족함'
  } else if (score >= 47) {
    return '하위 30%. 체계적인 관리가 시급함'
  } else if (score >= 43) {
    return '하위 25%. 현실적인 눈높이 조정이 필요한 시점'
  } else if (score >= 39) {
    return '하위 20%. 외모 외 스펙으로 보완해야 함'
  } else if (score >= 35) {
    return '하위 15%. 기본적인 관리부터 다시 점검 필요'
  } else if (score >= 31) {
    return '하위 10%. 연애시장에서 상당히 불리한 위치'
  } else if (score >= 27) {
    return '하위 5%. 외모 개선 없이는 힘든 상황'
  } else if (score >= 23) {
    return '하위 3%. 생활습관부터 전면 재검토 필요'
  } else {
    return '현실 직시 필요. 장기적인 자기관리 플랜 수립 권장'
  }
}

function getEvaluationParagraphs(score: number): { p1: string; p2: string } {
  if (score >= 85) {
    return {
      p1: '객관적으로 상위권 외모입니다. 이목구비 비율, 체형 모두 평균 이상이며 첫인상에서 확실한 우위를 점할 수 있습니다.',
      p2: '다만 외모가 좋다고 연애가 쉬운 건 아닙니다. 성격, 경제력 등 다른 요소도 중요하지만, 일단 외모에서 탈락할 일은 없습니다.',
    }
  } else if (score >= 75) {
    return {
      p1: '나쁘지 않은 외모입니다. 치명적인 단점은 없으나, 압도적인 장점도 부족합니다. 스타일링과 관리로 충분히 상위권 진입이 가능한 구간입니다.',
      p2: '현재 상태로는 경쟁에서 "그냥 무난한 사람" 취급받을 가능성이 높습니다. 차별화된 매력 포인트를 만들어야 합니다.',
    }
  } else if (score >= 60) {
    return {
      p1: '솔직히 말해서 평균입니다. 눈에 띄는 장점이 없고, 첫인상에서 강한 인상을 주기 어렵습니다. 매칭 시장에서 치열한 경쟁을 각오해야 합니다.',
      p2: '이 구간에서는 외모보다 스펙, 대화력, 유머 등 다른 경쟁력을 키우는 게 현실적입니다. 외모 올인은 비효율적입니다.',
    }
  } else if (score >= 45) {
    return {
      p1: '냉정하게 평균 이하입니다. 체형 관리가 부족하거나 나이 대비 경쟁력이 떨어집니다. 연애 시장에서 선택받기 쉽지 않은 위치입니다.',
      p2: '헛된 기대보다 현실적인 눈높이 조정이 필요합니다. 자신의 리그를 정확히 파악하고 그 안에서 승부해야 합니다.',
    }
  } else if (score >= 30) {
    return {
      p1: '하위권입니다. 외모로 승부하기엔 현실적으로 어려운 상황입니다. BMI 관리, 기본적인 청결과 스타일링부터 다시 점검해야 합니다.',
      p2: '연애보다 자기계발에 집중하는 게 장기적으로 유리합니다. 경제력이나 사회적 지위로 보완하는 전략을 고려하세요.',
    }
  } else {
    return {
      p1: '현실을 직시해야 합니다. 현재 상태로는 연애 시장에서 심각하게 불리합니다. 체중 관리, 건강 관리부터 시작해야 합니다.',
      p2: '외모 점수를 올리기 전에 기본적인 생활 습관 개선이 우선입니다. 장기적인 플랜을 세우고 하나씩 개선해 나가세요.',
    }
  }
}

function calculateImprovement(score: number) {
  // 점수가 낮을수록 개선 폭이 큼 (현실적)
  let improvement: number
  if (score < 40) {
    improvement = 12
  } else if (score < 55) {
    improvement = 10
  } else if (score < 70) {
    improvement = 7
  } else if (score < 85) {
    improvement = 4
  } else {
    improvement = 2 // 이미 높은 점수는 개선 여지 적음
  }

  const improvedScore = clamp(score + improvement, 0, 95)
  
  // 개선된 헌팅 성공률 계산
  let improvedHuntingRate: number
  if (improvedScore >= 85) {
    improvedHuntingRate = clamp(Math.round(improvedScore * 0.9 - 10), 60, 85)
  } else if (improvedScore >= 70) {
    improvedHuntingRate = clamp(Math.round(improvedScore * 0.65 - 5), 35, 59)
  } else if (improvedScore >= 55) {
    improvedHuntingRate = clamp(Math.round(improvedScore * 0.45 - 5), 15, 34)
  } else {
    improvedHuntingRate = clamp(Math.round(improvedScore * 0.3), 8, 14)
  }

  // 개선된 결정사 비용 계산
  let improvedAgencyCost: number
  if (improvedScore >= 85) {
    improvedAgencyCost = clamp(Math.round(150 - (improvedScore - 85) * 5), 80, 150)
  } else if (improvedScore >= 70) {
    improvedAgencyCost = clamp(Math.round(300 - (improvedScore - 70) * 10), 150, 300)
  } else if (improvedScore >= 55) {
    improvedAgencyCost = clamp(Math.round(450 - (improvedScore - 55) * 10), 300, 450)
  } else {
    improvedAgencyCost = clamp(Math.round(550 - (improvedScore - 40) * 7), 450, 550)
  }

  return { improvedScore, improvedHuntingRate, improvedAgencyCost }
}

// ============ Toast Component ============

const ToastOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 1000;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  pointer-events: none;
`

// ============ Component ============

function Result() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [input, setInputState] = useState<FaceAppInput | null>(null)
  const [result, setResultState] = useState<FaceAppResult | null>(null)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [isSharedView, setIsSharedView] = useState(false)

  useEffect(() => {
    // URL 파라미터에서 공유 데이터 확인
    const sharedData = searchParams.get('data')
    
    if (sharedData) {
      // 공유 링크로 접속한 경우
      const decoded = decodeShareData(sharedData)
      if (decoded) {
        setIsSharedView(true)
        setInputState({
          age: null,
          height: null,
          weight: null,
          gender: decoded.gender,
          images: decoded.image ? [decoded.image] : [],
        })
        setResultState({
          score: decoded.score,
          huntingRate: decoded.huntingRate,
          agencyCost: decoded.agencyCost,
        })
        return
      }
    }

    // 일반 접속: localStorage에서 데이터 로드
    const inputData = getInput()
    const resultData = getResult()

    if (!inputData || !resultData) {
      navigate('/')
      return
    }

    setInputState(inputData)
    setResultState(resultData)
  }, [navigate, searchParams])

  if (!input || !result) {
    return null
  }

  const { score, huntingRate, agencyCost } = result
  const scoreComment = getScoreComment(score)
  const evaluation = getEvaluationParagraphs(score)
  const improvement = calculateImprovement(score)

  const costSaved = Math.max(0, agencyCost - improvement.improvedAgencyCost)
  const rateIncrease = Math.max(0, improvement.improvedHuntingRate - huntingRate)

  const handleReset = () => {
    clearAll()
    navigate('/')
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const handleShare = async () => {
    // 공유 데이터 생성 (이미지는 URL 길이 문제로 제외)
    const shareData: ShareData = {
      gender: input.gender,
      score,
      huntingRate,
      agencyCost,
    }

    // 공유 링크 생성
    const encoded = encodeShareData(shareData)
    const shareUrl = `${window.location.origin}/result?data=${encoded}`

    // 모바일: Web Share API 지원 시
    if (navigator.share) {
      try {
        await navigator.share({
          title: '응니얼굴 - 외모 분석 결과',
          url: shareUrl,
        })
        showToastMessage('공유 완료!')
      } catch (err) {
        // 사용자가 공유 취소한 경우
        if ((err as Error).name !== 'AbortError') {
          // 공유 실패 시 클립보드로 폴백
          await copyToClipboard(shareUrl)
        }
      }
    } else {
      // PC: 클립보드에 링크 복사
      await copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToastMessage('🔗 공유 링크가 복사되었습니다!')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToastMessage('🔗 공유 링크가 복사되었습니다!')
    }
  }

  const handleTryAnalysis = () => {
    navigate('/')
  }

  return (
    <Container>
      {/* 공유된 결과인 경우 안내 배너 */}
      {isSharedView && (
        <SharedBanner>
          👀 친구의 외모 분석 결과입니다
        </SharedBanner>
      )}

      {/* 업로드한 이미지 갤러리 */}
      {input.images.length > 0 ? (
        <ImageGallery>
          {input.images.length === 1 ? (
            <GalleryImage $single>
              <GalleryImg src={input.images[0]} alt="업로드한 사진" />
            </GalleryImage>
          ) : (
            <>
              <ImageSlider>
                {input.images.map((img, idx) => (
                  <GalleryImage key={idx}>
                    <GalleryImg src={img} alt={`업로드한 사진 ${idx + 1}`} />
                  </GalleryImage>
                ))}
              </ImageSlider>
              <ImageCounter>
                👈 좌우로 스와이프해서 {input.images.length}장의 사진 보기
              </ImageCounter>
            </>
          )}
        </ImageGallery>
      ) : isSharedView ? (
        <SharedResultIcon>
          {input.gender === 'female' ? '👩' : '👨'}
        </SharedResultIcon>
      ) : null}

      {/* 핵심 요약 카드 */}
      <SummaryCard>
        <SummaryLine>
          {input.gender === 'female' ? '👩 여성' : '👨 남성'}
        </SummaryLine>
        <ScoreNumber>✨ {score}점</ScoreNumber>
        <SummaryLine $highlight>{scoreComment}</SummaryLine>
        <SummaryLine>🎯 헌팅 포차 성공확률 <strong>{huntingRate}%</strong></SummaryLine>
        <SummaryLine>💰 결정사 예상 비용 <strong>{agencyCost}만원</strong></SummaryLine>
      </SummaryCard>

      {/* 섹션 1. 외모 평가 */}
      <Section>
        <SectionTitle>📊 외모 평가</SectionTitle>
        <Paragraph>{evaluation.p1}</Paragraph>
        <Paragraph>{evaluation.p2}</Paragraph>
      </Section>

      {/* 섹션 2. 솔루션 */}
      <Section>
        <SectionTitle>💡 맞춤 솔루션</SectionTitle>
        <Paragraph>
          <strong>얼굴/인상 개선:</strong> 피부 톤 정리와 눈썹 정돈만으로도 인상이 크게 달라집니다. 
          자연스러운 그루밍을 통해 깔끔한 첫인상을 만들어 보세요.
        </Paragraph>
        <Paragraph>
          <strong>스타일/헤어 개선:</strong> 얼굴형에 맞는 헤어스타일로 비율을 보완하고, 
          체형에 맞는 핏감의 옷을 선택하는 것이 중요합니다.
        </Paragraph>
        <Paragraph>
          <strong>전체 외모 상승 전략:</strong> 한 가지 요소만 바꾸기보다는 
          헤어 + 패션 + 피부관리를 동시에 개선하면 시너지 효과가 큽니다.
        </Paragraph>
      </Section>

      {/* 헤어 스타일 추천 */}
      <Section>
        <SectionTitle>💇 추천 헤어 스타일</SectionTitle>
        <HorizontalScroll>
          {getRandomHairStyles(
            input.gender === 'male' ? maleHairStyles : femaleHairStyles,
            score + huntingRate + agencyCost
          ).map((style, idx) => (
            <HairCard 
              key={idx}
              href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                `${style.name} ${input.gender === 'male' ? '남자' : '여자'} 헤어스타일`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CardImage $imageUrl={style.imageUrl} />
              <CardText><strong>{style.name}</strong><br/>{style.description}</CardText>
            </HairCard>
          ))}
        </HorizontalScroll>
        <SmallNote>
          👆 탭하면 구글에서 스타일 검색 | 👈 스와이프로 더 보기
        </SmallNote>
      </Section>

      {/* 옷 스타일 추천 */}
      <Section>
        <SectionTitle>👔 추천 패션 스타일</SectionTitle>
        <ClothGrid>
          {getRandomClothingItems(
            input.gender === 'male' ? maleClothingItems : femaleClothingItems,
            score + huntingRate + agencyCost
          ).map((item, idx) => (
            <ClothCardLink 
              key={idx} 
              href={item.productUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ClothImage $imageUrl={item.imageUrl} />
              <ClothName>{item.name}</ClothName>
              <ClothDesc>{item.description}</ClothDesc>
            </ClothCardLink>
          ))}
        </ClothGrid>
        <SmallNote>👆 탭하면 무신사에서 상품을 볼 수 있어요</SmallNote>
      </Section>

      {/* 솔루션 효과 요약 */}
      <EffectCard>
        <EffectTitle>🚀 솔루션 적용 시 기대 효과</EffectTitle>
        <EffectItem>💰 결정사 비용 <EffectNumber>{costSaved}만원</EffectNumber> 절감!</EffectItem>
        <EffectItem>📈 헌팅 성공률 <EffectNumber>{rateIncrease}%</EffectNumber> 상승!</EffectItem>
      </EffectCard>

      {/* 액션 버튼 */}
      <ButtonRow>
        {isSharedView ? (
          <ActionButton $primary onClick={handleTryAnalysis}>
            🔮 나도 분석해보기
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={handleReset}>🔄 다시 분석</ActionButton>
            <ActionButton $primary onClick={handleShare}>
              📤 결과 공유
            </ActionButton>
          </>
        )}
      </ButtonRow>

      {/* 토스트 메시지 */}
      <ToastOverlay $visible={showToast}>
        {toastMessage}
      </ToastOverlay>
    </Container>
  )
}

export default Result
