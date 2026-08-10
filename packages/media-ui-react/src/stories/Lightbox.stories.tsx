import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLightbox } from '../hooks/useLightbox';

interface DemoPhoto {
  id: number;
  src: { large: string };
  alt: string;
}

const items: DemoPhoto[] = Array.from({ length: 6 }, (_, i) => {
  const seed = i + 10;
  return {
    id: seed,
    src: { large: `https://picsum.photos/seed/${seed}/800/600` },
    alt: `Photo ${seed}`,
  };
});

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.75)',
} as const;

const dialogStyle = {
  position: 'fixed',
  inset: 0,
  margin: 'auto',
  width: 'min(90vw, 700px)',
  height: 'min(85vh, 500px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#16171d',
  borderRadius: 10,
  border: '1px solid #2e303a',
} as const;

const navButtonStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 40,
  height: 40,
  border: '1px solid #4b4d59',
  background: 'rgba(22, 23, 29, 0.85)',
  color: '#e5e6eb',
  cursor: 'pointer',
  borderRadius: 6,
  fontSize: 20,
} as const;

function LightboxDemo() {
  // The prop-getter pattern is never abstracted away — every getXProps()
  // call below is spread directly onto its element.
  const {
    activeIndex,
    open,
    getLightboxProps,
    getOverlayProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    lightboxRef,
  } = useLightbox({ items, onClose: () => console.log('[Lightbox] closed') });

  useEffect(() => {
    open(0);
  }, [open]);

  const activeItem = items[activeIndex];

  return (
    <>
      <div {...getOverlayProps()} style={overlayStyle} />
      <div {...getLightboxProps()} ref={lightboxRef} style={dialogStyle}>
        <button
          {...getCloseButtonProps()}
          style={{ ...navButtonStyle, top: 12, right: 12, transform: 'none' }}
        >
          ✕
        </button>
        <button {...getPrevButtonProps()} style={{ ...navButtonStyle, left: 12 }}>
          ‹
        </button>
        {activeItem && (
          <img
            src={activeItem.src.large}
            alt={activeItem.alt}
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 6 }}
          />
        )}
        <button {...getNextButtonProps()} style={{ ...navButtonStyle, right: 12 }}>
          ›
        </button>
      </div>
    </>
  );
}

const meta = {
  title: 'media-ui-react/useLightbox',
  component: LightboxDemo,
} satisfies Meta<typeof LightboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KeyboardNav: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Escape closes the lightbox, ArrowLeft/ArrowRight navigate between items, ' +
          'and Tab/Shift+Tab stay trapped inside the dialog while it is open — all ' +
          'wired up automatically by useLightbox via getLightboxProps().onKeyDown.',
      },
    },
  },
};
