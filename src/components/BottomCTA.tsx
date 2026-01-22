import styled, { keyframes } from 'styled-components'

interface BottomCTAProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const CTAWrapper = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 24px;
  background: linear-gradient(to top, rgba(26, 26, 46, 1) 60%, transparent);
  z-index: 1000;
`

const CTAButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  height: 60px;
  background: ${({ $disabled }) =>
    $disabled
      ? 'linear-gradient(135deg, #4a4a6a 0%, #3a3a5a 100%)'
      : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)'};
  color: ${({ $disabled }) => ($disabled ? 'rgba(255,255,255,0.5)' : '#fff')};
  font-size: 18px;
  font-weight: 700;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ $disabled }) =>
    $disabled
      ? 'none'
      : '0 4px 20px rgba(139, 92, 246, 0.4)'};
  animation: ${({ $disabled }) => ($disabled ? 'none' : pulse)} 2s infinite;
  background-size: 200% 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
    opacity: ${({ $disabled }) => ($disabled ? 0 : 1)};
  }

  &:hover {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateY(-2px)')};
    box-shadow: ${({ $disabled }) =>
      $disabled
        ? 'none'
        : '0 8px 30px rgba(139, 92, 246, 0.5)'};
  }

  &:active {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'scale(0.98)')};
  }
`

const ButtonLabel = styled.span`
  position: relative;
  z-index: 1;
`

function BottomCTA({ label, onClick, disabled = false }: BottomCTAProps) {
  return (
    <CTAWrapper>
      <CTAButton $disabled={disabled} onClick={onClick} disabled={disabled}>
        <ButtonLabel>{label}</ButtonLabel>
      </CTAButton>
    </CTAWrapper>
  )
}

export default BottomCTA
