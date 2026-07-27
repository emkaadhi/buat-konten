import { Composition, type StillProps } from 'remotion';
import { ModernMinimal } from './templates/ModernMinimal';
import { VibrantBold } from './templates/VibrantBold';
import { ElegantWhite } from './templates/ElegantWhite';

// Each composition is a template variant
// Duration: 15 seconds at 30fps = 450 frames
const FPS = 30;
// SVG data URI for placeholder (no network needed)
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">' +
    '<rect width="800" height="800" fill="#e0e0e0"/>' +
    '<text x="400" y="380" text-anchor="middle" font-family="Arial" font-size="36" fill="#999">Product</text>' +
    '<text x="400" y="430" text-anchor="middle" font-family="Arial" font-size="36" fill="#999">Image</text>' +
    '</svg>'
  );

const DURATION_IN_FRAMES = 15 * FPS; // 15 seconds

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ModernMinimal"
        component={ModernMinimal as any}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          productName: 'Product Name',
          price: 'Rp 99.000',
          description: 'Product description goes here',
          imageUrl: PLACEHOLDER_IMAGE,
          hook: 'Your Hook Line Here!',
          cta: 'Order Now',
          primaryColor: '#1a1a2e',
          secondaryColor: '#e94560',
        }}
      />
      <Composition
        id="VibrantBold"
        component={VibrantBold as any}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          productName: 'Product Name',
          price: 'Rp 99.000',
          description: 'Product description goes here',
          imageUrl: PLACEHOLDER_IMAGE,
          hook: 'Your Hook Line Here!',
          cta: 'Order Now',
          primaryColor: '#ff6b35',
          secondaryColor: '#f7c59f',
        }}
      />
      <Composition
        id="ElegantWhite"
        component={ElegantWhite as any}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          productName: 'Product Name',
          price: 'Rp 99.000',
          description: 'Product description goes here',
          imageUrl: PLACEHOLDER_IMAGE,
          hook: 'Your Hook Line Here!',
          cta: 'Order Now',
          primaryColor: '#1a1a2e',
          secondaryColor: '#c9a96e',
        }}
      />
    </>
  );
};