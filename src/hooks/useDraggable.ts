import { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

/**
 * 使元素可拖动的 Hook
 * @param initialPosition 初始位置（可选）
 */
export const useDraggable = (initialPosition?: Position) => {
  const [position, setPosition] = useState<Position>(
    initialPosition || { x: 0, y: 0 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;

    const rect = dragRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;

      // 限制在窗口范围内
      const maxX = window.innerWidth - dragRef.current.offsetWidth;
      const maxY = window.innerHeight - dragRef.current.offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
  };
};
