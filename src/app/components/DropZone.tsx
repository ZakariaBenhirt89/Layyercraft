import { useDrop } from 'react-dnd';

type DropZoneProps = {
  parentId?: string;
  onDrop: (item: { type: string; props: Record<string, any>; children?: string }, parentId?: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function DropZone({ parentId, onDrop, className, style, children }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string; props: Record<string, any>; children?: string }) => {
      onDrop(item, parentId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const active = isOver && canDrop;

  return (
    <div
      ref={drop}
      style={style}
      className={`${className ?? ''} ${active ? 'ring-2 ring-blue-400 ring-opacity-60' : ''}`}
    >
      {children}
    </div>
  );
}
