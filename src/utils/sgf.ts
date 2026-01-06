import { Move, StoneType } from '@/types/game';
import { BOARD_SIZE } from './constants';

/**
 * Generate SGF (Smart Game Format) content from move history
 */
export const generateSGF = (
  moveHistory: Move[],
  blackName: string = 'Black',
  whiteName: string = 'White',
  result: string = ''
): string => {
  const date = new Date().toISOString().split('T')[0];

  // Header
  // GM[11] = Game Type (11 for Gomoku/Renju, 1 for Go)
  // FF[4] = File Format 4
  // SZ[15] = Board Size 15
  // PB/PW = Player Black/White
  // DT = Date
  let sgf = `(;GM[11]FF[4]CA[UTF-8]AP[GeminiGomoku]SZ[${BOARD_SIZE}]`;
  sgf += `
PB[${blackName}]PW[${whiteName}]DT[${date}]`;

  if (result) {
    sgf += `RE[${result}]`;
  }

  // Moves
  // SGF coordinates: 'a' is 0, 'b' is 1, etc.
  // Note: SGF usually has origin at top-left.
  // Example: ;B[hh];W[hi]

  const toSgfCoord = (idx: number) => String.fromCharCode(97 + idx); // 97 is 'a'

  moveHistory.forEach((move) => {
    const color = move.player === StoneType.BLACK ? 'B' : 'W';
    // Col is X (horizontal), Row is Y (vertical)
    // SGF expects [col][row] (aa is top-left)
    const coord = toSgfCoord(move.position.col) + toSgfCoord(move.position.row);
    sgf += `
;${color}[${coord}]`;
  });

  sgf += ')';
  return sgf;
};

export const downloadSGF = (content: string, filename: string = 'game.sgf') => {
  const blob = new Blob([content], { type: 'application/x-go-sgf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
