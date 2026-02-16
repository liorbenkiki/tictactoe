import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RotateCcw, Trophy, AlertTriangle, Info, Bot, Download } from 'lucide-react';
import { Player, GameState, AppState, GameMode, PlayerSymbol } from './types';
import { INITIAL_PLAYERS, INITIAL_GAME_STATE } from './constants';
import { checkWinner, getNextDisappearingMoveIndex } from './utils/gameUtils';
import { getBestMove } from './utils/aiUtils';
import { Modal } from './components/Modal';
import { PlayerCard } from './components/PlayerCard';
import { Board } from './components/Board';

// Local Storage Key
const STORAGE_KEY = 'tacticinfinity_data_v2';

const App: React.FC = () => {
  // State Initialization
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed: AppState = JSON.parse(savedData);
        // Merge with default in case of schema changes (handling the new isBot properties)
        const mergedPlayers = parsed.players.map((p, i) => ({
          ...INITIAL_PLAYERS[i],
          ...p
        }));
        setPlayers(mergedPlayers);
        setGameState(parsed.gameState);
      } catch (e) {
        console.error("Failed to parse saved game data", e);
      }
    } else {
      // First time load: Randomize starting player
      const randomStart = Math.random() < 0.5 ? 0 : 1;
      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: randomStart,
        lastStarterIndex: randomStart
      }));
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on Change
  useEffect(() => {
    if (!isLoaded) return;
    const data: AppState = { players, gameState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [players, gameState, isLoaded]);

  // Derived State
  const currentPlayer = players[gameState.currentPlayerIndex];

  // Game Logic Handlers
  const handleCellClick = useCallback((index: number) => {
    // Check constraints using the latest closure values
    if (gameState.board[index] || gameState.winner) return;

    // Use current state derived directly to avoid stale closures in setTimeout/async updates
    setGameState(prevState => {
      const currentP = players[prevState.currentPlayerIndex];
      let newMoves = [...prevState.moves];
      let newBoard = [...prevState.board];

      // Handle Disappearing Moves Logic
      if (prevState.gameMode === 'disappearing') {
        const playerMoves = newMoves.filter(m => m.playerSymbol === currentP.symbol);
        if (playerMoves.length >= 3) {
          const moveToRemove = playerMoves[0];
          newMoves = newMoves.filter(m => m.cellIndex !== moveToRemove.cellIndex);
          newBoard[moveToRemove.cellIndex] = null;
        }
      }

      // Add new move
      newMoves.push({ playerSymbol: currentP.symbol, cellIndex: index });
      newBoard[index] = currentP.symbol;

      // Check Win
      const winResult = checkWinner(newBoard);

      let newWinner = prevState.winner;
      let newWinningLine = prevState.winningLine;

      if (winResult) {
        newWinner = winResult.winner;
        newWinningLine = winResult.line;
        if (newWinner !== 'draw') {
          const currentWins = players.find(p => p.symbol === newWinner)?.wins ?? 0;
          setPlayers(prevPlayers => prevPlayers.map(p =>
            p.symbol === newWinner ? { ...p, wins: currentWins + 1 } : p
          ));
        }
      }

      return {
        ...prevState,
        board: newBoard,
        moves: newMoves,
        currentPlayerIndex: winResult ? prevState.currentPlayerIndex : (prevState.currentPlayerIndex === 0 ? 1 : 0),
        winner: newWinner,
        winningLine: newWinningLine
      };
    });
  }, [players, gameState.gameMode, gameState.board, gameState.winner]);

  // Bot Turn Effect
  useEffect(() => {
    // Only run if it's a bot's turn, game is loaded, and no winner yet
    if (!isLoaded || gameState.winner || !currentPlayer.isBot) return;

    // Start Thinking
    setIsThinking(true);

    const thinkTime = 700; // Artificial delay for natural feel
    const timer = setTimeout(() => {
      const bestMove = getBestMove(
        gameState.board,
        gameState.moves,
        currentPlayer.symbol,
        currentPlayer.difficulty,
        gameState.gameMode
      );

      if (bestMove !== -1) {
        handleCellClick(bestMove);
      }
      setIsThinking(false);
    }, thinkTime);

    return () => clearTimeout(timer);
  }, [
    gameState.currentPlayerIndex,
    gameState.winner,
    gameState.board,
    gameState.moves,
    gameState.gameMode,
    isLoaded,
    currentPlayer,
    handleCellClick
  ]);


  const startNewGame = useCallback(() => {
    const nextStarter = gameState.lastStarterIndex === 0 ? 1 : 0;
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      moves: [],
      currentPlayerIndex: nextStarter,
      lastStarterIndex: nextStarter,
      winner: null,
      winningLine: null
    }));
  }, [gameState.lastStarterIndex]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      moves: [],
      winner: null,
      winningLine: null,
      currentPlayerIndex: prev.lastStarterIndex
    }));
  }, []);

  const updatePlayer = (index: number, updates: Partial<Player>) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], ...updates };
    setPlayers(newPlayers);
  };

  // Settings Actions
  const resetStats = () => {
    setPlayers(players.map(p => ({ ...p, wins: 0 })));
    setIsSettingsOpen(false);
  };

  const factoryReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayers(INITIAL_PLAYERS);
    const randomStart = Math.random() < 0.5 ? 0 : 1;
    setGameState({
      ...INITIAL_GAME_STATE,
      currentPlayerIndex: randomStart,
      lastStarterIndex: randomStart
    });
    setIsSettingsOpen(false);
  };

  const changeGameMode = (mode: GameMode) => {
    if (mode === gameState.gameMode) return;
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      board: Array(9).fill(null),
      moves: [],
      winner: null,
      winningLine: null,
      currentPlayerIndex: prev.lastStarterIndex
    }));
    setIsSettingsOpen(false);
  };

  const nextDisappearingIndex = gameState.gameMode === 'disappearing' && !gameState.winner
    ? getNextDisappearingMoveIndex(gameState.moves, currentPlayer.symbol)
    : null;

  if (!isLoaded) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6 px-4 selection:bg-indigo-500/30">

      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            {gameState.gameMode === 'classic' ? 'Classic' : 'Infinity'} TicTacToe
          </h1>
          {gameState.gameMode === 'disappearing' && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Info size={12} /> Max 3 moves per player
            </p>
          )}
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Players */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
        {players.map((p, idx) => (
          <PlayerCard
            key={p.id}
            player={p}
            isActive={!gameState.winner && gameState.currentPlayerIndex === idx}
            onUpdatePlayer={(updates) => updatePlayer(idx, updates)}
            isWinner={gameState.winner === p.symbol}
          />
        ))}
      </div>

      {/* Game Board */}
      <div className="mb-8 w-full flex justify-center relative">
        <Board
          board={gameState.board}
          onCellClick={handleCellClick}
          winningLine={gameState.winningLine}
          isGameOver={!!gameState.winner}
          disappearingIndex={nextDisappearingIndex}
          isInteractable={!isThinking && !currentPlayer.isBot}
        />
        {isThinking && !gameState.winner && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600 shadow-xl flex items-center gap-2 animate-pulse z-20 pointer-events-none">
            <Bot size={16} className="text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">Thinking...</span>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.winner && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-xl animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 p-6">
              <div className="text-3xl font-black flex flex-col items-center gap-2 drop-shadow-xl">
                {gameState.winner === 'draw' ? (
                  <span className="text-slate-200 tracking-wider uppercase">It's a Draw!</span>
                ) : (
                  <>
                    <Trophy size={48} className="text-yellow-400 mb-2 drop-shadow-lg" />
                    <span className={`tracking-wider uppercase ${gameState.winner === 'X' ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {players.find(p => p.symbol === gameState.winner)?.name} Wins!
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={startNewGame}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <RotateCcw size={20} /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game Status / Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {!gameState.winner && (
          <div className="h-16 flex items-center">
            <button
              onClick={resetGame}
              disabled={isThinking}
              className="text-slate-500 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              <RotateCcw size={14} /> Restart Round
            </button>
          </div>
        )}

        {/* Install PWA Button */}
        {installPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-sm font-medium transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <Download size={16} />
            Install App
          </button>
        )}
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <div className="space-y-6">
          {/* Game Mode Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Game Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => changeGameMode('classic')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${gameState.gameMode === 'classic'
                  ? 'bg-indigo-500/20 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
              >
                Classic
              </button>
              <button
                onClick={() => changeGameMode('disappearing')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${gameState.gameMode === 'disappearing'
                  ? 'bg-indigo-500/20 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
              >
                Infinity (Max 3)
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {gameState.gameMode === 'classic'
                ? "Standard rules. 3 in a row wins."
                : "Only 3 pieces allowed per player. Placing a 4th removes your 1st."
              }
            </p>
          </div>

          <hr className="border-slate-700" />

          {/* Reset Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Danger Zone</h3>

            <button
              onClick={resetStats}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all text-left group"
            >
              <span className="text-slate-300 group-hover:text-white font-medium">Reset Scores</span>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Keeps names</span>
            </button>

            <button
              onClick={factoryReset}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all text-left group"
            >
              <span className="text-red-400 group-hover:text-red-300 font-medium flex items-center gap-2">
                <AlertTriangle size={16} /> Factory Reset
              </span>
              <span className="text-xs bg-red-900/20 px-2 py-1 rounded text-red-400">Wipes everything</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;