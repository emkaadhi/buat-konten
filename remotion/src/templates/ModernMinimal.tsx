import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, Sequence } from 'remotion';
import type { ProductPromoProps } from '../types';

export const ModernMinimal: React.FC<ProductPromoProps> = ({
  productName,
  price,
  description,
  imageUrl,
  hook,
  cta,
  primaryColor = '#1a1a2e',
  secondaryColor = '#e94560',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene 1: Hook (0-30%)
  const scene1End = Math.floor(durationInFrames * 0.3);
  // Scene 2: Product showcase (30-70%)
  const scene2Start = scene1End;
  const scene2End = Math.floor(durationInFrames * 0.7);
  // Scene 3: CTA (70-100%)
  const scene3Start = scene2End;

  // Background gradient animation
  const bgRotation = interpolate(frame, [0, durationInFrames], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${bgRotation}deg, ${primaryColor}, #16213e, ${primaryColor})`,
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Scene 1: Hook with product image background */}
      <Sequence from={0} durationInFrames={scene1End}>
        <Scene1
          hook={hook}
          imageUrl={imageUrl}
          frame={frame}
          sceneEnd={scene1End}
          secondaryColor={secondaryColor}
        />
      </Sequence>

      {/* Scene 2: Product details */}
      <Sequence from={scene2Start} durationInFrames={scene2End - scene2Start}>
        <Scene2
          productName={productName}
          price={price}
          description={description}
          imageUrl={imageUrl}
          frame={frame - scene2Start}
          sceneEnd={scene2End - scene2Start}
          secondaryColor={secondaryColor}
        />
      </Sequence>

      {/* Scene 3: CTA */}
      <Sequence from={scene3Start} durationInFrames={durationInFrames - scene3Start}>
        <Scene3
          cta={cta}
          productName={productName}
          frame={frame - scene3Start}
          sceneEnd={durationInFrames - scene3Start}
          secondaryColor={secondaryColor}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const Scene1: React.FC<{
  hook: string;
  imageUrl: string;
  frame: number;
  sceneEnd: number;
  secondaryColor: string;
}> = ({ hook, imageUrl, frame, sceneEnd, secondaryColor }) => {
  const progress = interpolate(frame, [0, sceneEnd], [0, 1]);
  const opacity = interpolate(progress, [0, 0.1, 1], [0, 1, 1]);
  const scale = interpolate(progress, [0, 1], [1.1, 1]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Background image with overlay */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
          }}
        />
      </div>

      {/* Hook text */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 40px',
          opacity,
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.3,
            display: 'block',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {hook}
        </span>
      </div>
    </div>
  );
};

const Scene2: React.FC<{
  productName: string;
  price: string;
  description: string;
  imageUrl: string;
  frame: number;
  sceneEnd: number;
  secondaryColor: string;
}> = ({ productName, price, description, imageUrl, frame, sceneEnd, secondaryColor }) => {
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [0, sceneEnd], [0, 1]);

  const imageScale = spring({
    frame: frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const textY = interpolate(progress, [0, 0.3], [50, 0]);
  const textOpacity = interpolate(progress, [0, 0.3], [0, 1]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        gap: 20,
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          transform: `scale(${imageScale})`,
        }}
      >
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Product info */}
      <div style={{ textAlign: 'center', transform: `translateY(${textY}px)`, opacity: textOpacity }}>
        <span
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: '#ffffff',
            display: 'block',
            marginBottom: 8,
          }}
        >
          {productName}
        </span>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: secondaryColor,
            display: 'block',
            marginBottom: 12,
          }}
        >
          {price}
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: '#cccccc',
            display: 'block',
            maxWidth: 400,
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </div>
    </div>
  );
};

const Scene3: React.FC<{
  cta: string;
  productName: string;
  frame: number;
  sceneEnd: number;
  secondaryColor: string;
}> = ({ cta, productName, frame, sceneEnd, secondaryColor }) => {
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  const pulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [1, 1.05]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        background: `radial-gradient(circle at center, ${secondaryColor}22, #000000)`,
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: '#ffffff',
          opacity: 0.8,
        }}
      >
        {productName}
      </span>
      <div
        style={{
          background: secondaryColor,
          padding: '20px 60px',
          borderRadius: 50,
          transform: `scale(${scale * pulse})`,
          boxShadow: `0 0 40px ${secondaryColor}66`,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: 2,
          }}
        >
          {cta}
        </span>
      </div>
    </div>
  );
};