import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useGrid } from '../hooks/useGrid';

interface DemoPhoto {
  id: number;
  src: { medium: string };
  alt: string;
  photographer: string;
}

function makeItems(count: number, offset = 0): DemoPhoto[] {
  return Array.from({ length: count }, (_, i) => {
    const n = offset + i + 1;
    return {
      id: n,
      src: { medium: `https://picsum.photos/seed/${n}/400/300` },
      alt: `Photo ${n}`,
      photographer: 'Picsum',
    };
  });
}

const gridDecoratorStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
  padding: '16px',
} as const;

interface GridDemoProps {
  simulateInfiniteScroll?: boolean;
  isLoading?: boolean;
}

function GridDemo({ simulateInfiniteScroll = false, isLoading = false }: GridDemoProps) {
  const [items, setItems] = useState<DemoPhoto[]>(() => makeItems(12));
  const [loading, setLoading] = useState(isLoading);

  const hasNextPage = simulateInfiniteScroll ? items.length < 24 : false;

  const handleLoadMore = () => {
    if (!simulateInfiniteScroll || loading) return;
    setLoading(true);
    // Fetch simulation: results arrive after 1s and are appended.
    setTimeout(() => {
      setItems(prev => [...prev, ...makeItems(6, prev.length)]);
      setLoading(false);
    }, 1000);
  };

  // The prop-getter pattern is never abstracted away — getContainerProps()
  // and getItemProps() are spread directly onto the elements below.
  const { getContainerProps, getItemProps, sentinelRef } = useGrid({
    items,
    onLoadMore: handleLoadMore,
    hasNextPage,
    isLoading: loading,
    columns: 3,
    onItemClick: index => console.log('[Grid] item clicked', items[index]),
  });

  return (
    <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid #30363d' }}>
      <div style={gridDecoratorStyle}>
        <div {...getContainerProps()} style={{ display: 'contents' }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              {...getItemProps(i)}
              style={{
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                borderRadius: 8,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <img
                src={item.src.medium}
                alt={item.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
          {loading && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 12 }}>Loading more…</p>
          )}
          {/* Matches production usage: an empty, aria-hidden element observed by
              IntersectionObserver. Not visible, not interactive — it is not meant
              to be clicked, only scrolled into view. */}
          <div ref={sentinelRef} aria-hidden="true" style={{ gridColumn: '1 / -1', height: 1 }} />
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'media-ui-react/useGrid',
  component: GridDemo,
} satisfies Meta<typeof GridDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InfiniteScroll: Story = {
  args: { simulateInfiniteScroll: true },
};

export const Loading: Story = {
  args: { isLoading: true },
};
