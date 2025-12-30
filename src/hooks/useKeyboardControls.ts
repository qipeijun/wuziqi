import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameStatus } from '@/types/game';

export const useKeyboardControls = () => {
  const { undoMove, resetGame, status } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Meta/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (status === GameStatus.PLAYING) {
          undoMove();
        }
      }

      // New Game: Meta/Ctrl + R (Customize this if needed, browser default is reload)
      // Let's use Meta/Ctrl + Shift + N for new game instead to avoid conflicts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        // Defaulting to PVP for quick restart, or just reset logic
        if (window.confirm('确定要重新开始吗？')) {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoMove, resetGame, status]);
};
