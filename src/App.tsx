import { Routes, Route } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Home from "./pages/Home";
import Loading from "./pages/Loading";
import Result from "./pages/Result";

// PC 배경 애니메이션
const floatEmoji = keyframes`
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
`;

const drift = keyframes`
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(20px) translateY(-10px); }
  50% { transform: translateX(0) translateY(-20px); }
  75% { transform: translateX(-20px) translateY(-10px); }
`;

// PC 전용 배경 래퍼
const PCBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;

  @media (max-width: 480px) {
    display: none;
  }
`;

// 떠다니는 이모지
const FloatingEmoji = styled.span<{
  $left: string;
  $delay: number;
  $duration: number;
  $size: number;
}>`
  position: absolute;
  left: ${({ $left }) => $left};
  bottom: -50px;
  font-size: ${({ $size }) => $size}px;
  animation: ${floatEmoji} ${({ $duration }) => $duration}s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
`;

// 반짝이는 별
const Sparkle = styled.div<{
  $top: string;
  $left: string;
  $delay: number;
  $size: number;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
  border-radius: 50%;
  animation: ${sparkle} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// 글로우 오브
const GlowOrb = styled.div<{
  $top: string;
  $left: string;
  $color: string;
  $size: number;
  $delay: number;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color }) => $color};
  border-radius: 50%;
  filter: blur(40px);
  animation: ${pulse} 4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// 드리프팅 이모지 (천천히 떠다니는)
const DriftingEmoji = styled.span<{
  $top: string;
  $left: string;
  $delay: number;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  font-size: 40px;
  animation: ${drift} 8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  opacity: 0.7;
`;

// PC 사이드 텍스트
const SideText = styled.div<{ $side: "left" | "right" }>`
  position: fixed;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 40px;" : "right: 40px;")}
  transform: translateY(-50%) ${({ $side }) =>
    $side === "left" ? "rotate(-90deg)" : "rotate(90deg)"};
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 4px;
  white-space: nowrap;
  pointer-events: none;

  @media (max-width: 900px) {
    display: none;
  }
`;

const AppContainer = styled.div`
  max-width: 420px;
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const SafetyNotice = styled.footer`
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  padding: 20px;
  margin-top: auto;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
`;

// 떠다니는 이모지 목록
const floatingEmojis = [
  { emoji: "✨", left: "5%", delay: 0, duration: 15, size: 30 },
  { emoji: "💫", left: "15%", delay: 2, duration: 18, size: 25 },
  { emoji: "🌟", left: "25%", delay: 5, duration: 20, size: 35 },
  { emoji: "⭐", left: "8%", delay: 8, duration: 16, size: 28 },
  { emoji: "💎", left: "20%", delay: 12, duration: 22, size: 32 },
  { emoji: "🔮", left: "12%", delay: 4, duration: 19, size: 30 },
  { emoji: "✨", left: "75%", delay: 1, duration: 17, size: 28 },
  { emoji: "💫", left: "85%", delay: 6, duration: 21, size: 26 },
  { emoji: "🌟", left: "92%", delay: 3, duration: 15, size: 34 },
  { emoji: "⭐", left: "78%", delay: 10, duration: 18, size: 30 },
  { emoji: "💎", left: "88%", delay: 7, duration: 20, size: 25 },
  { emoji: "🔮", left: "95%", delay: 9, duration: 16, size: 32 },
  { emoji: "🎀", left: "3%", delay: 11, duration: 23, size: 28 },
  { emoji: "💜", left: "97%", delay: 14, duration: 19, size: 26 },
];

function App() {
  return (
    <>
      {/* PC 배경 데코레이션 */}
      <PCBackground>
        {/* 글로우 오브 */}
        <GlowOrb
          $top="10%"
          $left="10%"
          $color="rgba(139, 92, 246, 0.3)"
          $size={200}
          $delay={0}
        />
        <GlowOrb
          $top="60%"
          $left="5%"
          $color="rgba(236, 72, 153, 0.25)"
          $size={150}
          $delay={2}
        />
        <GlowOrb
          $top="30%"
          $left="85%"
          $color="rgba(59, 130, 246, 0.3)"
          $size={180}
          $delay={1}
        />
        <GlowOrb
          $top="70%"
          $left="90%"
          $color="rgba(139, 92, 246, 0.25)"
          $size={160}
          $delay={3}
        />

        {/* 반짝이는 별 */}
        <Sparkle $top="15%" $left="8%" $delay={0} $size={8} />
        <Sparkle $top="25%" $left="18%" $delay={1.5} $size={6} />
        <Sparkle $top="45%" $left="12%" $delay={0.8} $size={10} />
        <Sparkle $top="65%" $left="22%" $delay={2.2} $size={7} />
        <Sparkle $top="85%" $left="8%" $delay={1} $size={9} />
        <Sparkle $top="20%" $left="88%" $delay={0.5} $size={8} />
        <Sparkle $top="40%" $left="92%" $delay={1.8} $size={6} />
        <Sparkle $top="55%" $left="82%" $delay={2.5} $size={10} />
        <Sparkle $top="75%" $left="95%" $delay={0.3} $size={7} />
        <Sparkle $top="90%" $left="85%" $delay={1.2} $size={9} />

        {/* 떠다니는 이모지 */}
        {floatingEmojis.map((item, idx) => (
          <FloatingEmoji
            key={idx}
            $left={item.left}
            $delay={item.delay}
            $duration={item.duration}
            $size={item.size}
          >
            {item.emoji}
          </FloatingEmoji>
        ))}

        {/* 드리프팅 이모지 */}
        <DriftingEmoji $top="20%" $left="5%" $delay={0}>
          👀
        </DriftingEmoji>
        <DriftingEmoji $top="50%" $left="2%" $delay={2}>
          💅
        </DriftingEmoji>
        <DriftingEmoji $top="80%" $left="8%" $delay={4}>
          🪞
        </DriftingEmoji>
        <DriftingEmoji $top="15%" $left="90%" $delay={1}>
          💄
        </DriftingEmoji>
        <DriftingEmoji $top="45%" $left="93%" $delay={3}>
          👑
        </DriftingEmoji>
        <DriftingEmoji $top="75%" $left="88%" $delay={5}>
          💎
        </DriftingEmoji>
      </PCBackground>

      {/* 사이드 텍스트 */}
      <SideText $side="left">✨ AI FACE ANALYSIS ✨</SideText>
      <SideText $side="right">✨ STYLE RECOMMENDATION ✨</SideText>

      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/result" element={<Result />} />
        </Routes>
        <SafetyNotice>
          ⚠️ 본 결과는 오락 및 참고용이며 실제와 다를 수 있습니다
        </SafetyNotice>
      </AppContainer>
    </>
  );
}

export default App;
