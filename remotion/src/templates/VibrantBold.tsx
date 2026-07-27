import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, Sequence } from 'remotion';
import type { ProductPromoProps } from '../types';

export const VibrantBold: React.FC<ProductPromoProps> = ({
  productName,
  price,
  description,
  imageUrl,
  hook,
  cta,
  primaryColor = '#ff6b35',
  secondaryColor = '#f7c59f',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scene1End = Math.floor(durationInFrames * 0.25);
  const scene2Start = scene1End;
  const scene2End = Math.floor(durationInFrames * 0.65);
  const scene3Start = scene2End;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #2b2d42, #1a1a2e)`,
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `${primaryColor}33`,
          top: -100,
          right: -100,
          transform: `translateY(${interpolate(frame, [0, durationInFrames], [0, 50])}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `${secondaryColor}22`,
          bottom: -50,
          left: -80,
          transform: `translateY(${interpolate(frame, [0, durationInFrames], [0, -40])}px)`,
        }}
      />

      <Sequence from={0} durationInFrames={scene1End}>
        <VibrantScene1 hook={hook} imageUrl={imageUrl} frame={frame} sceneEnd={scene1End} primaryColor={primaryColor} />
      </Sequence>

      <Sequence from={scene2Start} durationInFrames={scene2End - scene2Start}>
        <VibrantScene2
          productName={productName}
          price={price}
          description={description}
          imageUrl={imageUrl}
          frame={frame - scene2Start}
          sceneEnd={scene2End - scene2Start}
          primaryColor={primaryColor}
        />
      </Sequence>

      <Sequence from={scene3Start} durationInFrames={durationInFrames - scene3Start}>
        <VibrantScene3 cta={cta} frame={frame - scene3Start} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </Sequence>
    </AbsoluteFill>
  );
};

const VibrantScene1: React.FC<{
  hook: string;
  imageUrl: string;
  frame: number;
  sceneEnd: number;
  primaryColor: string;
}> = ({ hook, imageUrl, frame, sceneEnd, primaryColor }) => {
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const y = interpolate(slideUp, [0, 1], [200, 0]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 30 }}>
      <div style={{ width: 250, height: 250, borderRadius: 20, overflow: 'hidden', border: `4px solid ${primaryColor}`, boxShadow: `0 0 40px ${primaryColor}44` }}>
        <Img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ transform: `translateY(${y}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: primaryColor, display: 'block', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16 }}>
          🔥 NEW ARRIVAL
        </span>
        <span style={{ fontSize: 48, fontWeight: 900, color: '#ffffff', display: 'block', textAlign: 'center', lineHeight: 1.3, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {hook}
        </span>
      </div>
    </div>
  );
};

const VibrantScene2: React.FC<{
  productName: string;
  price: string;
  description: string;
  imageUrl: string;
  frame: number;
  sceneEnd: number;
  primaryColor: string;
}> = ({ productName, price, description, imageUrl, frame, sceneEnd, primaryColor }) => {
  const progress = interpolate(frame, [0, sceneEnd], [0, 1]);
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  const textOpacity = interpolate(progress, [0, 0.2], [0, 1]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', transform: `scale(${scale})` }}>
        {/* Price badge */}
        <div style={{ background: primaryColor, padding: '8px 30px', borderRadius: 30, display: 'inline-block', marginBottom: 20 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#ffffff' }}>{price}</span>
        </div>

        <span style={{ fontSize: 44, fontWeight: 800, color: '#ffffff', display: 'block', marginBottom: 12 }}>
          {productName}
        </span>

        <div style={{ width: 60, height: 4, background: primaryColor, margin: '16px auto', borderRadius: 2, opacity: textOpacity }} />

        <span style={{ fontSize: 20, fontWeight: 400, color: '#cccccc', display: 'block', maxWidth: 380, lineHeight: 1.5, opacity: textOpacity, margin: '0 auto' }}>
          {description}
        </span>
      </div>
    </div>
  );
};

const VibrantScene3: React.FC<{
  cta: string;
  frame: number;
  primaryColor: string;
  secondaryColor: string;
}> = ({ cta, frame, primaryColor }) => {
  const { fps } = useVideoConfig();

  const bounce = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [1, 1.08]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>
        Jangan Sampai Kehabisan!
      </span>
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, #ff8c42)`,
          padding: '24px 70px',
          borderRadius: 16,
          transform: `scale(${bounce * pulse})`,
          boxShadow: `0 10px 50px ${primaryColor}66`,
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        <span style={{ fontSize: 44, fontWeight: 900, color: '#ffffff', letterSpacing: 3 }}>
          {cta}
        </span>
      </div>
    </div>
  );
};