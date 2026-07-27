import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, Sequence } from 'remotion';
import type { ProductPromoProps } from '../types';

export const ElegantWhite: React.FC<ProductPromoProps> = ({
  productName,
  price,
  description,
  imageUrl,
  hook,
  cta,
  primaryColor = '#1a1a2e',
  secondaryColor = '#c9a96e',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scene1End = Math.floor(durationInFrames * 0.3);
  const scene2Start = scene1End;
  const scene2End = Math.floor(durationInFrames * 0.65);
  const scene3Start = scene2End;

  return (
    <AbsoluteFill
      style={{
        background: '#faf9f6',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03 }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <Sequence from={0} durationInFrames={scene1End}>
        <WhiteScene1 hook={hook} imageUrl={imageUrl} frame={frame} sceneEnd={scene1End} secondaryColor={secondaryColor} primaryColor={primaryColor} />
      </Sequence>

      <Sequence from={scene2Start} durationInFrames={scene2End - scene2Start}>
        <WhiteScene2
          productName={productName}
          price={price}
          description={description}
          imageUrl={imageUrl}
          frame={frame - scene2Start}
          sceneEnd={scene2End - scene2Start}
          secondaryColor={secondaryColor}
          primaryColor={primaryColor}
        />
      </Sequence>

      <Sequence from={scene3Start} durationInFrames={durationInFrames - scene3Start}>
        <WhiteScene3 cta={cta} productName={productName} frame={frame - scene3Start} secondaryColor={secondaryColor} primaryColor={primaryColor} />
      </Sequence>
    </AbsoluteFill>
  );
};

const WhiteScene1: React.FC<{
  hook: string;
  imageUrl: string;
  frame: number;
  sceneEnd: number;
  secondaryColor: string;
  primaryColor: string;
}> = ({ hook, imageUrl, frame, sceneEnd, secondaryColor, primaryColor }) => {
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [0, sceneEnd], [0, 1]);

  const titleOpacity = interpolate(progress, [0, 0.2], [0, 1]);
  const titleY = interpolate(progress, [0, 0.3], [30, 0]);

  const imageScale = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 24 }}>
      <div style={{ width: 80, height: 3, background: secondaryColor, borderRadius: 2, opacity: titleOpacity }} />

      <span
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: primaryColor,
          textAlign: 'center',
          lineHeight: 1.3,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          maxWidth: 500,
        }}
      >
        {hook}
      </span>

      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `3px solid ${secondaryColor}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          transform: `scale(${imageScale})`,
        }}
      >
        <Img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ width: 40, height: 2, background: secondaryColor, opacity: 0.5 }} />
    </div>
  );
};

const WhiteScene2: React.FC<{
  productName: string;
  price: string;
  description: string;
  imageUrl: string;
  frame: number;
  sceneEnd: number;
  secondaryColor: string;
  primaryColor: string;
}> = ({ productName, price, description, imageUrl, frame, sceneEnd, secondaryColor, primaryColor }) => {
  const progress = interpolate(frame, [0, sceneEnd], [0, 1]);
  const opacity = interpolate(progress, [0, 0.2], [0, 1]);
  const y = interpolate(progress, [0, 0.3], [40, 0]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', opacity, transform: `translateY(${y}px)` }}>
        <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <Img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <span style={{ fontSize: 36, fontWeight: 700, color: primaryColor, display: 'block', marginBottom: 8 }}>
          {productName}
        </span>

        <span style={{ fontSize: 30, fontWeight: 400, color: secondaryColor, display: 'block', marginBottom: 16, fontStyle: 'italic' }}>
          {price}
        </span>

        <div style={{ width: 40, height: 2, background: secondaryColor, margin: '0 auto 16px', borderRadius: 1 }} />

        <span style={{ fontSize: 18, fontWeight: 300, color: '#666666', display: 'block', maxWidth: 380, lineHeight: 1.6, margin: '0 auto' }}>
          {description}
        </span>
      </div>
    </div>
  );
};

const WhiteScene3: React.FC<{
  cta: string;
  productName: string;
  frame: number;
  secondaryColor: string;
  primaryColor: string;
}> = ({ cta, productName, frame, secondaryColor, primaryColor }) => {
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const fadeIn = interpolate(frame, [0, 15], [0, 1]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: fadeIn }}>
      <div style={{ width: 60, height: 3, background: secondaryColor, borderRadius: 2 }} />
      <div
        style={{
          border: `2px solid ${secondaryColor}`,
          padding: '18px 60px',
          borderRadius: 50,
          transform: `scale(${scale})`,
          background: 'transparent',
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 600, color: primaryColor, letterSpacing: 3, textTransform: 'uppercase' }}>
          {cta}
        </span>
      </div>
      <span style={{ fontSize: 16, fontWeight: 300, color: '#999999' }}>
        {productName}
      </span>
    </div>
  );
};