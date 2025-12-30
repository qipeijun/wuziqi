import { useState } from 'react';
import { Board } from './components/Board/Board';
import { GameInfo } from './components/GameInfo/GameInfo';
import { GameMenu } from './components/GameMenu/GameMenu';
import { GameResult } from './components/GameResult/GameResult';
import { useGameStore } from './store/gameStore';
import { useAI } from './hooks/useAI';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { GameMode, GameStatus, AIDifficulty } from './types/game';
import styles from './App.module.scss';

function App() {
  const { status, initGame, mode, difficulty } = useGameStore();
  const { isThinking } = useAI();
  useKeyboardControls(); // Keyboard shortcuts
  const [showMenu, setShowMenu] = useState(status === GameStatus.WAITING);

  const handleStartGame = (mode: GameMode, difficulty?: AIDifficulty) => {
    initGame(mode, difficulty);
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
  };

  const handleRestart = () => {
    initGame(mode, difficulty);
  };

  return (
    <div className={styles.app}>
      {showMenu && <GameMenu onStartGame={handleStartGame} />}
      
      {!showMenu && (status === GameStatus.BLACK_WIN || status === GameStatus.WHITE_WIN || status === GameStatus.DRAW) && (
        <GameResult onRestart={handleRestart} onBackToMenu={handleBackToMenu} />
      )}

      <div className={styles.container}>
        <GameInfo />
        <Board />
        {isThinking && (
          <div className={styles.aiThinking}>
            <div className={styles.spinner} />
            <span>AI思考中...</span>
          </div>
        )}
      </div>

      {!showMenu && (
        <button className={styles.menuButton} onClick={handleBackToMenu}>
          返回菜单
        </button>
      )}
    </div>
  );
}

export default App;
