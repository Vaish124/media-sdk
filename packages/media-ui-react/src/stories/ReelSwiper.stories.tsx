import type { Meta, StoryObj } from '@storybook/react-vite';
import { useReelSwiper } from '../hooks/useReelSwiper';

interface DemoItem {
  id: number;
  color: string;
  label: string;
}

const items: DemoItem[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  color: `hsl(${i * 70}, 70%, 50%)`,
  label: `Item ${i + 1}`,
}));

const containerStyle = {
  height: 400,
  overflowY: 'scroll',
  scrollSnapType: 'y mandatory',
  position: 'relative',
  borderRadius: 8,
} as const;

const itemStyle = {
  height: 400,
  scrollSnapAlign: 'start',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  fontWeight: 700,
  color: '#16171d',
} as const;

interface ReelDemoProps {
  onActiveChange?: (index: number) => void;
}

function ReelDemo({ onActiveChange }: ReelDemoProps) {
  // The prop-getter pattern is never abstracted away — getContainerProps()
  // and getItemProps() are spread directly onto the elements below.
  const { activeIndex, getContainerProps, getItemProps } = useReelSwiper({
    items,
    onActiveChange,
  });

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          background: '#16171d',
          color: '#e5e6eb',
          border: '1px solid #2e303a',
          borderRadius: 999,
          padding: '4px 12px',
          fontSize: 13,
          zIndex: 10,
        }}
      >
        activeIndex: {activeIndex}
      </div>
      <div {...getContainerProps()} style={containerStyle}>
        {items.map((item, i) => (
          <div
            key={item.id}
            {...getItemProps(i)}
            style={{ ...itemStyle, background: item.color }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'media-ui-react/useReelSwiper',
  component: ReelDemo,
} satisfies Meta<typeof ReelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCallback: Story = {
  args: {
    onActiveChange: index => console.log('[ReelSwiper] active index changed to', index),
  },
};
